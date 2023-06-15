import * as d3 from 'd3';
import { autoType } from 'd3-dsv';
import { html } from 'htl';
import styles from '../stylesheets/barChartRace.module.css';

export default async function BarChartRace() {
	let data;
	try {
		const response = await fetch('http://127.0.0.1:8081/data/nbaData.csv');
		const csvData = await response.text();
		data = d3.csvParse(csvData, autoType).filter((d) => d.Lg !== 'ABA');
		console.log(data);
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

	// group data by Champion and sort by amount of championships
	const groupByChampion = d3.group(data, (d) => getName(d.Champion));
	console.log(groupByChampion);
	const championsSorted = Array.from(groupByChampion).sort((a, b) => b[1].length - a[1].length);
	console.log(championsSorted);
	championsSorted.forEach((entry, key) => {
		console.log(entry[0]);
		// console.log(teamLogos[entry[0]].img);
	});

	const container = d3.create('div').attr('id', styles['bar-chart-container']);

	const svg = d3.create('svg').attr('id', styles['nba-chart']);

	svg.selectAll('rect')
		.data(championsSorted)
		.join('rect')
		.attr('x', 30)
		.attr('y', (d, i) => i * 40 + 1)
		.attr('width', (d) => (d[1].length / 17) * 450)
		.attr('height', 38)

		// .attr('fill', (d) => teamLogos[d[0]].color)
		// make opacity 0.6
		.attr('opacity', 0.8)
		// on hover change color
		.on('mouseover', function (d) {
			d3.select(this).attr('fill', (d) => teamLogos[d[0]].color);
		})
		.on('mouseout', function (d) {
			d3.select(this).attr('fill', '#000');
		});

	// for each rectangle add images in porportion to the amount of championships
	championsSorted.forEach((entry, key) => {
		svg.append('g')
			.selectAll('image')
			.data(championsSorted[key][1])
			.join('image')
			.attr('href', `http://localhost:8081/content/lobtrophy.png`)
			.attr('x', (d, i) => i * 25 + 35)
			.attr('y', key * 40 + 10)
			.attr('width', 20)
			.attr('height', 20);
	});

	// add team logos to the bars
	svg.append('g')
		.selectAll('image')
		.data(championsSorted)
		.join('image')
		.attr('href', (d) => `http://localhost:8081/content/teamLogos/${teamLogos[d[0]].img}.png`)
		.attr('x', 0)
		.attr('y', (d, i) => i * 40 + 10)
		.attr('width', 20)
		.attr('height', 20);

	// add text to the bars
	svg.selectAll('text')
		.data(championsSorted)
		.join('text')
		.attr('x', 35)
		.attr('y', (d, i) => i * 40 + 20)
		.attr('dx', 5)
		.attr('dy', '0.35em')
		.text((d) => d[0])
		// add id of champion-text
		.attr('id', styles['champion-text'])
		// make appear on hover
		.attr('opacity', 0)
		// add mouseover event
		// LATER add tooltip *****
		.on('mouseover', (event, d) => {
			d3.select(event.currentTarget).attr('opacity', 1);
		})
		// add mouseout event
		.on('mouseout', (event, d) => {
			d3.select(event.currentTarget).attr('opacity', 0);
		});

	// svg.selectAll('div')
	// 	.data(championsSorted)
	// 	.join('g')
	// 	.attr('x', 0)
	// 	.attr('y', (d, i) => i * 40 + 1)
	// 	.attr('width', '100%')
	// 	.attr('height', 38)
	// 	.attr('fill', 'red')
	// 	// make red
	// 	// .attr('pointer-events', 'none')
	// 	// add mouseover event
	// 	// LATER add tooltip *****
	// 	.on('mouseover', (event, d, i) => {
	// 		console.log('hi');
	// 	});

	// const tooltips = svg
	// 	.append('g')
	// 	.selectAll('div')
	// 	.data(championsSorted)
	// 	.join('rect')
	// 	.attr('x', 30)
	// 	.attr('y', (d, i) => i * 40 + 1)
	// 	.attr('width', '100%')
	// 	.attr('height', 38);
	// opacity 0
	// .style('pointer-events', 'none');
	// .attr('opacity', 0)
	// .attr('pointer-events', 'none');
	// .attr('fill', 'none')

	// on hover change color
	// .on('mouseover', function (d) {
	// 	// d3.select(this).attr('fill', (d) => teamLogos[d[0]].color);
	// 	console.log(d);
	// })
	// .on('mouseout', function (d) {
	// 	// d3.select(this).attr('fill', '#000');
	// });

	const tooltip = d3
		.select(svg.node().parentNode)
		.append('div')
		.attr('class', styles.tooltip)
		.style('opacity', 0)
		.style('pointer-events', 'none'); // Add pointer-events: none

	// Attach event listeners to the SVG
	svg.on('mousemove', onMouseMove).on('mouseover', onMouseOver).on('mouseout', onMouseOut);

	// Event handler for mouse movement
	function onMouseMove(event) {
		const yPosition = d3.pointer(event)[1];
		console.log(yPosition);

		// Update the tooltip position and text
		tooltip
			.style('left', event.pageX + 10 + 'px')
			.style('top', event.pageY + 10 + 'px')
			.text('Y Position: ' + yPosition);
	}

	// Event handler for mouse over
	function onMouseOver() {
		console.log('hi');
		tooltip.transition().duration(200).style('opacity', 1);
	}

	// Event handler for mouse out
	function onMouseOut() {
		tooltip.transition().duration(200).style('opacity', 0);
	}

	container.append(() => svg.node());

	// append citation for Basketball Reference

	return container.node();
}
