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
			color: '#C4CED4',
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
		'Seattle SuperSonics': {
			img: 'thunder',
			color: '#007AC1',
		},
		'Washington Bullets': {
			img: 'bullets',
			color: '#E31837',
		},
		'Portland Trail Blazers': {
			img: 'blazers',
			color: '#E03A3E',
		},
		'St. Louis Hawks': {
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

	const getName = (team) => {
		if (team === 'Minneapolis Lakers') {
			return 'Los Angeles Lakers';
		} else if (team === 'Philadelphia Warriors') {
			return 'Golden State Warriors';
		} else if (team === 'Syracuse Nationals') {
			return 'Philadelphia 76ers';
		} else if (team === 'Rochester Royals') {
			return 'Sacramento Kings';
		} else if (team === 'Seatle SuperSonics') {
			return 'Oklahoma City Thunder';
		} else {
			return team;
		}
	};

	let keyframes = [];
	// for (let i = championships.length - 1; i >= 0; i--) {
	for (let i = 0; i < championships.length - 1; i++) {
		let current = [];
		let currentYear = championships[i].Year;
		current.push(currentYear);
		let currentChampion = getName(championships[i].Champion);
		if (i > 0) {
			const list = new Map(keyframes[keyframes.length - 1][1]);
			if (list.has(currentChampion)) {
				list.set(currentChampion, list.get(currentChampion) + 1);
				// sort list by amount of championships
				list[Symbol.iterator] = function* () {
					yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
				};
			} else {
				list.set(currentChampion, 1);
			}
			current.push(list);
		} else {
			const list = new Map();
			list.set(currentChampion, 1);
			current.push(list);
		}

		// gather data for specific championships
		const currentChampionships = championships.slice(0, i + 1);
		const championsGrouped = d3.group(currentChampionships, (d) => getName(d.Champion));
		// const championsSorted = Array.from(championsGrouped).sort((a, b) => b[1].length - a[1].length);
		// console.log('championsGrouped: ', championsGrouped);
		current.push(championsGrouped);
		keyframes.push(current);
	}
	console.log('keyframes: ', keyframes);

	// -----------------------------CREATE SVG AND APPEND BARS, LOGOS, YEAR TRACKER, & TROPHIES--------------------------------

	const svg = d3.create('svg').attr('id', 'nba-chart').attr('viewBox', [0, 0, 600, 900]);

	let bars = svg.append('g').attr('opacity', 0.9).attr('id', 'bars');
	svg.append('text').attr('id', 'year');

	function updateBars(keyframe, transition, currentTeam) {
		let update = d3.select('#bars').selectAll('rect');

		const data = Array.from(keyframe[1]);

		update
			.data(data)
			.join(
				(enter) =>
					enter
						.append('rect')
						.join('rect')
						.attr('x', 40)
						.attr('y', (d, i) => i * 40 + 1)
						.attr('width', (d) => `${(d[1] / 17) * 90}%`)
						.attr('height', 38)
						// .attr('fill', (d) => (d[0] === currentTeam ? teamLogos[d[0]].color : 'grey'))
						// using the class and ID for the tooltip
						.attr('class', 'champ-rect')
						.attr('id', (d, i) => `champ-rect-${i}`)
						.attr('rx', 5)
						.attr('ry', 5)
						.attr('opacity', 0.9),
				// .append('image')
				// .attr('href', 'http://localhost:8080/content/lobtrophy.png') // Replace 'trophy-image.png' with the actual path to your trophy image
				// .attr('x', (d) => d[1] * 30 + 45) // Adjust the positioning of the trophy image
				// .attr('y', (d, i) => i * 40 + 1 + 5) // Adjust the positioning of the trophy image
				// .attr('width', 20) // Adjust the size of the trophy image
				// .attr('height', 20), // Adjust the size of the trophy image
				(update) => update
			)
			.call((update) =>
				update
					.transition(transition)
					.attr('y', (d, i) => i * 40 + 1)
					.attr('width', (d) => `${(d[1] / 17) * 90}%`)
					.attr('fill', (d) => (d[0] === currentTeam ? teamLogos[d[0]].color : 'grey'))
			);
	}

	function updateTrophies(keyframe, transition, currentTeam) {
		// for each rectangle add images of trophies in porportion to the amount of championships
		// 	let update = d3.select('#bars').selectAll('rect');
		// 	const data = keyframe[2].get(getName(currentTeam));
		// 	console.log(data);
		// 	update
		// 		// .selectAll('image')
		// 		.data(data)
		// 		.join(
		// 			(enter) =>
		// 				enter
		// 					.append('image')
		// 					.join('image')
		// 					.attr('href', `http://localhost:8080/content/lobtrophy.png`)
		// 					.attr('x', (d, i) => i * 30 + 45)
		// 					// .attr('y', key * 40 + 10)
		// 					.attr('width', 20)
		// 					.attr('height', 20),
		// 			(update) => update
		// 		)
		// 		.call((update) => update.transition(transition).attr('x', (d, i) => i * 30 + 45));
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
				// (exit) =>
				// 	exit
				// 		.transition(transition)

				// 		.remove()
				// 		.attr('width', 0)
				// 		.attr('opacity', 0)
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

	function updateYear(keyframe, transition) {
		let past = d3.select('#year');
		const year = keyframe[0];
		past.remove();
		const now = svg
			.append('text')
			.attr('id', 'year')
			.text(year)
			.attr('x', 450)
			.attr('y', 800)
			.attr('font-size', 40)
			.attr('font-weight', 'bold');
	}

	// for each rectangle add images in porportion to the amount of championships
	// championsSorted.forEach((entry, key) => {
	// 	svg.append('g')
	// 		.selectAll('image')
	// 		.data(championsSorted[key][1])
	// 		.join('image')
	// 		.attr('href', `http://localhost:8080/content/lobtrophy.png`)
	// 		.attr('x', (d, i) => i * 30 + 45)
	// 		.attr('y', key * 40 + 10)
	// 		.attr('width', 20)
	// 		.attr('height', 20);
	// 	if (championsSorted[key][1].length > 1) {
	// 		svg.append('text')
	// 			// append at the end of the rectangle
	// 			.attr('x', `${(championsSorted[key][1].length / 17) * 95}%`)
	// 			.attr('y', key * 40 + 20)
	// 			.attr('dx', championsSorted[key][1].length < 17 ? 50 : 23)
	// 			.attr('dy', '0.35em')
	// 			.text((d) => `${championsSorted[key][1].length}`)
	// 			// .attr('class', 'champ-text')
	// 			// .attr('id', (d, i) => `champ-text-${i}`)
	// 			// .attr('opacity', 0)
	// 			// fill white
	// 			.attr('fill', '#000')
	// 			// font size
	// 			.attr('font-size', '10px')
	// 			// font wei
	// 			.attr('font-weight', '100')
	// 			// italics
	// 			.attr('font-style', 'italic')
	// 			.attr('text-anchor', 'middle');
	// 	}
	// });

	// -----------------------------TOOLTIPS--------------------------------

	const tooltip = d3
		.select(svg.node().parentNode)
		.append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0)
		.style('pointer-events', 'none'); // Add pointer-events: none

	// Attach event listeners to the SVG
	// svg.on('mousemove', onMouseMove).on('mouseleave', onMouseOut);

	// Event handler for mouse movement
	function onMouseMove(event) {
		const yPosition = d3.pointer(event)[1];
		// console.log(yPosition);
		const index = Math.floor(yPosition / 40);
		// console.log(index);
		if (index > championsSorted.length - 1 || index < 0) {
			d3.selectAll(`.champ-rect`).attr('fill', 'black');
			d3.selectAll(`.champ-text`).attr('opacity', 0);
			return;
		}
		// select element with id of champion-text
		d3.selectAll(`.champ-rect`).attr('fill', 'black');
		// d3.selectAll(`.champ-text`).attr('opacity', 0);
		d3.select(`#champ-rect-${index}`).attr('fill', teamLogos[championsSorted[index][0]].color);
		// d3.select(`#champ-text-${index}`).attr('opacity', 1);

		// Update the tooltip position and text
		tooltip
			.style('left', event.pageX + 10 + 'px')
			.style('top', event.pageY + 10 + 'px')
			.text('Y Position: ' + yPosition);
	}

	// Event handler for mouse over
	function onMouseOver() {
		// console.log('hi');
		// tooltip.transition().duration(200).style('opacity', 1);
	}

	// Event handler for mouse out
	function onMouseOut() {
		// tooltip.transition().duration(200).style('opacity', 0);
		d3.selectAll(`.champ-rect`).attr('fill', 'black');
		d3.selectAll(`.champ-text`).attr('opacity', 0);
	}

	// -----------------------------CALL GENERATOR FUNCTION ON KEYWORDS ARRAY--------------------------------

	yield svg.node();

	// for (const keyframe of keyframes) {
	// 	// set timeout 500ms
	// 	await new Promise((resolve) => setTimeout(resolve, 500));
	// 	// update the data
	// 	const transition = svg.transition().duration(500).ease(d3.easeLinear);

	// 	updateBars(keyframe, transition);
	// 	updateLogos(keyframe, transition);
	// 	updateYear(keyframe, transition);
	// }

	for (let i = 0; i <= keyframes.length; i++) {
		await new Promise((resolve) => setTimeout(resolve, 450));
		const transition = svg.transition().duration(450).ease(d3.easeLinear);
		// const colorTransition = svg.transition().duration(250).ease(d3.easeLinear);

		if (i === keyframes.length) {
			// this is to set all of the bars to the same color after the animation is finished
			updateBars(keyframes[i - 1], transition, 'none');
			return;
		}

		const current = championships[i];
		const currentTeam = getName(current.Champion);
		let last = null;
		if (i === keyframes.length - 1) last = i;

		updateBars(keyframes[i], transition, currentTeam);
		updateLogos(keyframes[i], transition);
		updateYear(keyframes[i], transition);
		updateTrophies(keyframes[i], transition, currentTeam);
	}

	// append citation for Basketball Reference **********************************************************************************************************************
}
