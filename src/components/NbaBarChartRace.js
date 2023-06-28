import * as d3 from 'd3';
import { autoType } from 'd3-dsv';

export default async function NbaBarChartRace() {
	// -----------------------------GET AND PROCESS DATA--------------------------------
	let championships;
	try {
		const response = await fetch('http://127.0.0.1:8081/data/nbaData.csv');
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

	// flag for PLAY/STOP button
	let stop = true;

	async function* BarChart(runSpeed = 500, play = false) {
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
		const bars = svg.append('g').attr('opacity', 0.9).attr('id', 'bars');

		function updateBars(keyframe, transition, currentTeam) {
			let update = d3.select('#bars').selectAll('rect');
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
							.attr('rx', 2)
							.attr('ry', 2)
							.attr('opacity', 0.8),
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

			const data = keyframe[1];

			update
				.data(data, (d) => d[0])
				.join(
					(enter) =>
						enter
							.append('image')
							.join('image')
							.attr('href', (d) => `http://localhost:8081/content/teamLogos/${teamLogos[d[0]].img}.png`)
							.attr('x', 0)
							.attr('y', (d, i) => i * 40 + 5)
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

		function updateText(keyframe, transition) {
			let update = d3.select('#bars').selectAll('text');
			const data = keyframe[1];

			update
				.data(data)
				.join(
					(enter) =>
						enter
							.append('text')
							.join('text')
							.text((d) => d[1].length)
							.attr('x', (d) => `${(d[1].length / 17) * 87}%`)
							.attr('y', (d, i) => i * 40 + 25)
							.attr('dx', '50')
							.attr('class', 'champ-text')
							.attr('opacity', 0),
					(update) => update
				)
				.call((update) =>
					update
						.transition(transition)
						.text((d) => d[1].length)
						.attr('x', (d) => `${(d[1].length / 17) * 87}%`)
						.attr('y', (d, i) => i * 40 + 25)
						.attr('opacity', 1)
				);
		}

		function updateYear(keyframe) {
			// let past = d3.select('#year');
			const past = document.getElementById('year');
			const year = keyframe[0];
			past.innerText = year;
		}

		// -----------------------------TOOLTIPS--------------------------------

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
					.attr('class', 'trophies')
					.attr('id', `trophies-${key}`)
					.attr('opacity', 0)
					.selectAll('image')
					.data(data[key][1])
					.join('image')
					.attr('href', `http://localhost:8081/content/lobtrophy.png`)
					.attr('x', (d, i) => i * 30 + 45)
					.attr('y', key * 40 + 8)
					// .attr('dy', '20')
					.attr('width', 25)
					.attr('height', 25)
					.style('cursor', 'pointer')
					.on('mouseover', function (d, data) {
						d3.select(this).attr('opacity', 0.7); // Reduce opacity on mouseover
						tooltip
							.style('visibility', 'visible') // Show tooltip on mouseover
							.style('left', `${event.pageX}px`) // Position tooltip relative to mouse cursor
							.style('top', `${event.pageY + 15}px`)
							.append('h4')
							.text(data.Year)
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
						tooltip.selectAll('h4').remove();
					});
			});
		};

		const addTooltips = (keyframe) => {
			const container = d3.select('#bar-chart-container');
			const svg = d3.select('#nba-chart');
			const data = keyframe[1];

			const infoDisplay = svg
				.append('text')
				.attr('id', 'info-display')
				.attr('x', 400)
				.attr('y', 400)
				.text('')
				.attr('text-anchor', 'middle');

			const infoDisplay2 = svg
				.append('text')
				.attr('id', 'info-display-2')
				.attr('x', 400)
				.attr('y', 425)
				.text('')
				.attr('text-anchor', 'middle');

			const allBars = d3.selectAll(`.champ-rect`);
			const allTrophies = d3.selectAll(`.trophies`);

			// Attach event listeners
			container.on('mousemove', onMouseMove).on('mouseleave', onMouseOut);

			// Event handler for mouse movement
			function onMouseMove(event) {
				const yPosition = d3.pointer(event)[1];
				const index = Math.floor(yPosition / 40);
				if (index > data.length - 1 || index < 0) {
					allBars.attr('fill', barColor);
					allTrophies.attr('opacity', 0);
					infoDisplay.text('');
					infoDisplay2.text('');
					return;
				}
				allBars.attr('fill', barColor);
				d3.select(`#champ-rect-${index}`).attr('fill', teamLogos[data[index][0]].color);
				allTrophies.attr('opacity', 0);
				d3.selectAll(`#trophies-${index}`).attr('opacity', 1);
				infoDisplay.text(getName(data[index][0])).attr('fill', teamLogos[data[index][0]].color);
				infoDisplay2.text(`Championships: ${data[index][1].length}`);
			}

			function onMouseOut() {
				allBars.attr('fill', barColor);
				allTrophies.attr('opacity', 0);
				infoDisplay.text('');
				infoDisplay2.text('');
			}
		};

		// -----------------------------CALL GENERATOR FUNCTION ON KEYWORDS ARRAY--------------------------------

		yield svg.node();

		const transition = svg.transition().duration(runSpeed).ease(d3.easeLinear);

		if (play) {
			for (let i = 0; i <= keyframes.length; i++) {
				await new Promise((resolve) => setTimeout(resolve, runSpeed));
				const transition = svg.transition().duration(runSpeed).ease(d3.easeLinear);

				if (i === keyframes.length) {
					// this is to set all of the bars to the same color after the animation is finished
					updateBars(keyframes[i - 1], transition, 'none');
					addTrophies(keyframes[i - 1], transition);
					addTooltips(keyframes[i - 1]);
					return;
				}

				if (stop) {
					updateBars(keyframes[keyframes.length - 1], transition, 'none');
					updateLogos(keyframes[keyframes.length - 1], transition);
					updateYear(keyframes[keyframes.length - 1]);
					updateText(keyframes[keyframes.length - 1], transition);
					addTrophies(keyframes[keyframes.length - 1], transition);
					addTooltips(keyframes[keyframes.length - 1]);
					return;
				}

				const current = championships[i];
				const currentTeam = getName(current.Champion);

				updateBars(keyframes[i], transition, currentTeam);
				updateLogos(keyframes[i], transition);
				updateYear(keyframes[i]);
				updateText(keyframes[i], transition);
			}
		} else {
			updateBars(keyframes[keyframes.length - 1], transition, 'none');
			updateLogos(keyframes[keyframes.length - 1], transition);
			addTrophies(keyframes[keyframes.length - 1], transition);
			addTooltips(keyframes[keyframes.length - 1]);
			updateYear(keyframes[keyframes.length - 1]);
		}

		// append citation for Basketball Reference **********************************************************************************************************************
	}

	let chartGenerator = BarChart();
	const mainContainer = document.createElement('div');
	mainContainer.setAttribute('class', 'main-container');
	const chartContainer = document.createElement('div');
	chartContainer.setAttribute('id', 'bar-chart-container');

	const play = async function (runSpeed) {
		const playButton = document.getElementById('play-button');
		// toggle class on button
		// playButton.classList.toggle('play-button-disabled');
		playButton.classList.remove('bounce');
		playButton.innerText = 'STOP';
		// disable button
		// playButton.disabled = true;
		chartGenerator = BarChart(runSpeed, true);

		for await (const chartNode of chartGenerator) {
			// Clear the previous chart
			while (chartContainer.firstChild) {
				chartContainer.firstChild.remove();
			}
			// Append the new chart node to the container
			chartContainer.appendChild(chartNode);
		}
		// playButton.classList.toggle('play-button-disabled');
		// playButton.disabled = false;
		stop = true;
		playButton.innerText = 'PLAY';
	};

	(async function renderChart() {
		const head = document.createElement('div');
		head.setAttribute('id', 'head');

		const year = document.createElement('h1');
		year.setAttribute('id', 'year');
		year.innerText = 'Year';

		const title = document.createElement('h2');
		title.setAttribute('id', 'title');
		title.innerText = 'History of NBA Champions';
		const subtitle = document.createElement('h3');
		subtitle.setAttribute('id', 'subtitle');
		subtitle.innerText = 'Hover over bars for details on specific championships';

		const controls = document.createElement('div');
		controls.setAttribute('id', 'controls');

		const playButton = document.createElement('button');
		playButton.setAttribute('id', 'play-button');
		playButton.setAttribute('class', 'bounce');
		playButton.innerText = 'PLAY';
		playButton.addEventListener('click', () => {
			if (stop) {
				stop = false;
				const runSpeed = document.getElementById('speed-input').value;
				play(runSpeed);
			} else {
				stop = true;
			}
		});

		const speed = document.createElement('div');
		speed.setAttribute('id', 'speed');

		const speedInput = document.createElement('input');
		speedInput.setAttribute('id', 'speed-input');
		speedInput.setAttribute('name', 'speed-input');
		speedInput.setAttribute('type', 'number');
		speedInput.setAttribute('min', '50');
		speedInput.setAttribute('max', '1000');
		speedInput.setAttribute('value', '500');
		speedInput.setAttribute('step', '50');
		// make label for speed
		const speedLabel = document.createElement('text');
		// speedLabel.setAttribute('for', 'speed-input');
		speedLabel.setAttribute('id', 'speed-label');
		speedLabel.innerText = 'Set Speed (ms): ';

		speed.appendChild(speedLabel);
		speed.appendChild(speedInput);

		controls.appendChild(speed);
		controls.appendChild(playButton);
		head.appendChild(year);
		head.appendChild(controls);

		mainContainer.appendChild(head);
		mainContainer.appendChild(title);
		mainContainer.appendChild(subtitle);

		mainContainer.appendChild(chartContainer);
		document.body.appendChild(mainContainer);
		for await (const chartNode of chartGenerator) {
			// Clear the previous chart
			while (chartContainer.firstChild) {
				chartContainer.firstChild.remove();
			}
			// Append the new chart node to the container
			chartContainer.appendChild(chartNode);
		}
	})();
}
