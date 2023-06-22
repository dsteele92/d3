import * as d3 from 'd3';
import { autoType } from 'd3-dsv';
import { html } from 'htl';

export default async function* NbaBarChartRace() {
	// -----------------------------GET AND PROCESS DATA--------------------------------

	let championships;
	try {
		const response = await fetch('http://127.0.0.1:8080/data/nbaData.csv');
		const csvData = await response.text();
		championships = d3
			.csvParse(csvData, autoType)
			.filter((d) => d.Lg !== 'ABA')
			.reverse();
		console.log('championships:', championships);
	} catch (error) {
		console.log('Error loading the CSV file:', error);
		const errorDiv = d3.create('div').text('Error loading the CSV file').attr('class', 'error');

		return errorDiv.node();
	}

	const teamLogos = {
		'Boston Celtics': {
			img: 'celtics',
			color: '#007A33',
		},
		'Los Angeles Lakers': {
			img: 'lakers',
			color: '#552583',
		},
		'Chicago Bulls': {
			img: 'bulls',
			color: '#CE1141',
		},
		'Golden State Warriors': {
			img: 'warriors',
			color: '#1D428A',
		},
		'San Antonio Spurs': {
			img: 'spurs',
			color: '#3D3D3D',
		},
		'Minneapolis Lakers': {
			img: 'lakers',
			color: '#552583',
		},
		'Miami Heat': {
			img: 'heat',
			color: '#98002E',
		},
		'Detroit Pistons': {
			img: 'pistons',
			color: '#C8102E',
		},
		'Milwaukee Bucks': {
			img: 'bucks',
			color: '#00471B',
		},
		'Houston Rockets': {
			img: 'rockets',
			color: '#CE1141',
		},
		'Philadelphia 76ers': {
			img: '76ers',
			color: '#006BB6',
		},
		'New York Knicks': {
			img: 'knicks',
			color: '#F58426',
		},
		'Philadelphia Warriors': {
			img: 'warriors',
			color: '#1D428A',
		},
		'Denver Nuggets': {
			img: 'nuggets',
			color: '#0E2240',
		},
		'Toronto Raptors': {
			img: 'raptors',
			color: '#CE1141',
		},
		'Cleveland Cavaliers': {
			img: 'cavaliers',
			color: '#860038',
		},
		'Dallas Mavericks': {
			img: 'mavericks',
			color: '#00538C',
		},
		'Oklahoma City Thunder': {
			img: 'thunder',
			color: '#007AC1',
		},
		'Washington Wizards': {
			img: 'wizards',
			color: '#192976',
		},
		'Portland Trail Blazers': {
			img: 'blazers',
			color: '#E03A3E',
		},
		'Atlanta Hawks': {
			img: 'hawks',
			color: '#E03A3E',
		},
		'Syracuse Nationals': {
			img: '76ers',
			color: '#006BB6',
		},
		'Sacramento Kings': {
			img: 'kings',
			color: '#5A2D81',
		},
		'Rochester Royals': {
			img: 'kings',
			color: '#5A2D81',
		},
		'Baltimore Bullets': {
			img: 'bullets',
			color: '#E31837',
		},
	};

	const barColor = '#918c80';

	const names = new Map();
	names.set('Minneapolis Lakers', 'Los Angeles Lakers');
	names.set('Philadelphia Warriors', 'Golden State Warriors');
	names.set('Syracuse Nationals', 'Philadelphia 76ers');
	names.set('Rochester Royals', 'Sacramento Kings');
	names.set('Seattle SuperSonics', 'Oklahoma City Thunder');
	names.set('Washington Bullets', 'Washington Wizards');
	names.set('St. Louis Hawks', 'Atlanta Hawks');
	const getName = (team) => {
		if (names.has(team)) {
			return names.get(team);
		} else {
			return team;
		}
	};

	let keyframes = [];
	// for (let i = championships.length - 1; i >= 0; i--) {
	for (let i = 0; i < championships.length; i++) {
		let current = [];
		let currentYear = championships[i].Year;
		const currentChampionships = championships.slice(0, i + 1);
		const championsGrouped = d3.group(currentChampionships, (d) => getName(d.Champion));
		const championsSorted = Array.from(championsGrouped).sort((a, b) => {
			const lengthComp = b[1].length - a[1].length;
			if (lengthComp !== 0) return lengthComp;
			return b[1][b[1].length - 1].Year - a[1][a[1].length - 1].Year;
		});
		current.push(currentYear, championsSorted);
		keyframes.push(current);
	}
	console.log('keyframes: ', keyframes);

	// -----------------------------CREATE SVG AND APPEND BARS, LOGOS, YEAR TRACKER, & TROPHIES--------------------------------

	const svg = d3.create('svg').attr('id', 'nba-chart').attr('viewBox', [0, 0, 600, 900]);

	let bars = svg.append('g').attr('opacity', 0.9).attr('id', 'bars');
	svg.append('text').attr('id', 'year');

	function updateBars(keyframe, transition, currentTeam) {
		let update = d3.select('#bars').selectAll('rect');

		// const data = Array.from(keyframe[1]);
		const data = keyframe[1];

		update
			.data(data)
			.join(
				(enter) =>
					enter
						.append('rect')
						.join('rect')
						.attr('x', 40)
						.attr('y', (d, i) => i * 40 + 1)
						.attr('width', (d) => `${(d[1].length / 17) * 87}%`)
						.attr('height', 38)
						.attr('class', 'champ-rect')
						.attr('id', (d, i) => `champ-rect-${i}`)
						.attr('rx', 5)
						.attr('ry', 5)
						.attr('opacity', 0.9),
				(update) => update
			)
			.call((update) =>
				update
					.transition(transition)
					.attr('y', (d, i) => i * 40 + 1)
					.attr('width', (d) => `${(d[1].length / 17) * 87}%`)
					.attr('fill', (d) => (d[0] === currentTeam ? teamLogos[d[0]].color : barColor))
			);
	}

	function updateLogos(keyframe, transition) {
		let update = d3.select('#bars').selectAll('image');

		const data = Array.from(keyframe[1]);

		update
			.data(data, (d) => d[0])
			.join(
				(enter) =>
					enter
						.append('image')
						.join('image')
						.attr('href', (d) => `http://localhost:8080/content/teamLogos/${teamLogos[d[0]].img}.png`)
						.attr('x', 0)
						.attr('y', (d, i) => i * 40 + 5)
						// .attr('dy', '0.35em')
						.attr('width', 30)
						.attr('height', 30),
				(update) => update
			)
			.call((update) =>
				update
					.transition(transition)
					.attr('y', (d, i) => i * 40 + 5)
					.attr('width', 30)
					.attr('height', 30)
					.attr('opacity', 1)
			);
	}

	function updateYear(keyframe) {
		let past = d3.select('#year');
		const year = keyframe[0];
		past.remove();
		const now = svg.append('text').attr('id', 'year').text(year).attr('x', 350).attr('y', 750).attr('fill', 'grey');
	}

	// for each rectangle add images in porportion to the amount of championships
	const addTrophies = (keyframe, transition) => {
		const data = keyframe[1];

		const tooltip = d3
			.select('body')
			.append('div')
			.attr('class', 'tooltip')
			.style('position', 'absolute')
			.style('visibility', 'hidden');

		data.forEach((entry, key) => {
			svg.append('g')
				.selectAll('image')
				.data(data[key][1])
				.join('image')
				.attr('href', `http://localhost:8080/content/lobtrophy.png`)
				.attr('x', (d, i) => i * 30 + 45)
				.attr('y', key * 40 + 30)
				.attr('width', 25)
				.attr('height', 25)
				.attr('opacity', 0)
				.style('cursor', 'pointer')
				.on('mouseover', function (d, data) {
					d3.select(this).attr('opacity', 0.7); // Reduce opacity on mouseover
					tooltip
						.style('visibility', 'visible') // Show tooltip on mouseover
						// .text(data.Year)
						.style('left', `${event.pageX}px`) // Position tooltip relative to mouse cursor
						.style('top', `${event.pageY + 15}px`)
						// append an h4 tag with the year
						.append('h4')
						.text(data.Year)
						// .style('font-style', 'italic')
						.append('h4')
						.text(data.Champion)
						.style('font-weight', 'bold')
						.append('h4')
						.text(`Finals MVP: ${data['Finals MVP'] ? data['Finals MVP'] : 'N/A'}`)
						.append('h4')
						.text(`Runner-up: ${data['Runner-Up']}`);
				})
				.on('mouseout', function () {
					d3.select(this).attr('opacity', 1); // Restore opacity on mouseout
					tooltip.style('visibility', 'hidden'); // Hide tooltip on mouseout
					// remove all h4 tags
					tooltip.selectAll('h4').remove();
				})
				.transition(transition)
				.attr('opacity', 1)
				.attr('y', key * 40 + 8);
		});
	};

	// -----------------------------TOOLTIPS--------------------------------

	const addTooltips = (keyframe) => {
		const container = d3.select('#bar-chart-container');
		const svg = d3.select('#nba-chart');
		const data = keyframe[1];

		const infoDisplay = svg
			.append('text')
			.attr('id', 'info-display')
			.attr('x', 400)
			.attr('y', 550)
			.text('')
			.attr('text-anchor', 'middle');

		const infoDisplay2 = svg
			.append('text')
			.attr('id', 'info-display-2')
			.attr('x', 400)
			.attr('y', 575)
			.text('')
			.attr('text-anchor', 'middle');

		// Attach event listeners
		container.on('mousemove', onMouseMove).on('mouseleave', onMouseOut);

		// Event handler for mouse movement
		function onMouseMove(event) {
			const yPosition = d3.pointer(event)[1];
			// 20px for the padding
			const index = Math.floor((yPosition - 20) / 40);
			if (index > data.length - 1 || index < 0) {
				d3.selectAll(`.champ-rect`).attr('fill', barColor);
				// d3.selectAll(`.champ-text`).attr('opacity', 0);
				infoDisplay.text('');
				infoDisplay2.text('');
				return;
			}
			d3.selectAll(`.champ-rect`).attr('fill', barColor);
			d3.select(`#champ-rect-${index}`).attr('fill', teamLogos[data[index][0]].color);
			infoDisplay.text(getName(data[index][0])).attr('fill', teamLogos[data[index][0]].color);
			infoDisplay2.text(`Championships: ${data[index][1].length}`);
		}

		function onMouseOut() {
			d3.selectAll(`.champ-rect`).attr('fill', barColor);
		}
	};

	// -----------------------------CALL GENERATOR FUNCTION ON KEYWORDS ARRAY--------------------------------

	yield svg.node();

	for (let i = 0; i <= keyframes.length; i++) {
		await new Promise((resolve) => setTimeout(resolve, 400));
		const transition = svg.transition().duration(400).ease(d3.easeLinear);

		if (i === keyframes.length) {
			// this is to set all of the bars to the same color after the animation is finished
			updateBars(keyframes[i - 1], transition, 'none');
			addTrophies(keyframes[i - 1], transition);
			addTooltips(keyframes[i - 1]);
			return;
		}

		const current = championships[i];
		const currentTeam = getName(current.Champion);
		let last = null;
		if (i === keyframes.length - 1) last = i;

		updateBars(keyframes[i], transition, currentTeam);
		updateLogos(keyframes[i], transition);
		updateYear(keyframes[i]);
	}

	// append citation for Basketball Reference **********************************************************************************************************************
}
