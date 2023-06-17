import * as d3 from 'd3';
import { autoType } from 'd3-dsv';
import { html } from 'htl';

export default async function NbaBarChart() {
	let data;
	try {
		const response = await fetch('http://127.0.0.1:8080/data/nbaData.csv');
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

	// const width = '100%';
	const height = 800;

	const container = d3
		.create('div')
		.attr('id', 'bar-chart-container')
		.style('width', '100%')
		.style('height', '900px');
	const svg = d3.create('svg').attr('id', 'nba-chart').attr('viewBox', [0, 0, 600, 900]).attr('width', '100%');
	// set max width of svg
	// get width and height of svg
	// const width = svg.node().getBoundingClientRect().width;

	// console.log(width);

	svg.selectAll('rect')
		.data(championsSorted)
		.join('rect')
		.attr('x', 40)
		.attr('y', (d, i) => i * 40 + 1)
		.attr('width', (d) => `${(d[1].length / 17) * 90}%`)
		.attr('height', 38)
		// add id to each rectangle
		.attr('class', 'champ-rect')
		.attr('id', (d, i) => `champ-rect-${i}`)
		.attr('rx', 5)
		.attr('ry', 5)
		.attr('opacity', 0.75)
		// .attr('fill', (d) => teamLogos[d[0]].color)
		.on('mouseover', function (d) {
			d3.select(this).attr('fill', (d) => teamLogos[d[0]].color);
		})
		.on('mouseout', function (d) {
			d3.select(this).attr('fill', '#000');
		});

	svg.selectAll('text')
		.data(championsSorted)
		.join('text')
		.attr('x', 0)
		.attr('y', (d, i) => i * 40 + 20)
		.attr('dx', '50%')
		.attr('dy', '0.35em')

		.text((d) => `${d[0]} - ${d[1].length}`)
		// add id of champion-text
		.attr('class', 'champ-text')
		.attr('id', (d, i) => `champ-text-${i}`)
		.attr('opacity', 0)
		// make width 100% of the svg
		.attr('height', 38)
		// center the text horizontally
		.attr('text-anchor', 'middle');

	// for each rectangle add images in porportion to the amount of championships
	championsSorted.forEach((entry, key) => {
		svg.append('g')
			.selectAll('image')
			.data(championsSorted[key][1])
			.join('image')
			.attr('href', `http://localhost:8080/content/lobtrophy.png`)
			.attr('x', (d, i) => i * 30 + 45)
			.attr('y', key * 40 + 10)
			.attr('width', 20)
			.attr('height', 20);
		if (championsSorted[key][1].length > 1) {
			svg.append('text')
				// append at the end of the rectangle
				.attr('x', `${(championsSorted[key][1].length / 17) * 95}%`)
				.attr('y', key * 40 + 20)
				.attr('dx', championsSorted[key][1].length < 17 ? 50 : 23)
				.attr('dy', '0.35em')
				.text((d) => `${championsSorted[key][1].length}`)
				// .attr('class', 'champ-text')
				// .attr('id', (d, i) => `champ-text-${i}`)
				// .attr('opacity', 0)
				// fill white
				.attr('fill', '#000')
				// font size
				.attr('font-size', '10px')
				// font wei
				.attr('font-weight', '100')
				// italics
				.attr('font-style', 'italic')
				.attr('text-anchor', 'middle');
		}
	});

	// add team logos to the bars
	svg.append('g')
		.selectAll('image')
		.data(championsSorted)
		.join('image')
		.attr('href', (d) => `http://localhost:8080/content/teamLogos/${teamLogos[d[0]].img}.png`)
		.attr('x', 0)
		.attr('y', (d, i) => i * 40 + 10)
		.attr('width', 30)
		.attr('height', 30);

	const tooltip = d3
		.select(svg.node().parentNode)
		.append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0)
		.style('pointer-events', 'none'); // Add pointer-events: none

	// Attach event listeners to the SVG
	svg.on('mousemove', onMouseMove).on('mouseleave', onMouseOut);

	// Event handler for mouse movement
	function onMouseMove(event) {
		const yPosition = d3.pointer(event)[1];
		// console.log(yPosition);
		const index = Math.floor(yPosition / 40);
		console.log(index);
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
		console.log('hi');
		// tooltip.transition().duration(200).style('opacity', 1);
	}

	// Event handler for mouse out
	function onMouseOut() {
		// tooltip.transition().duration(200).style('opacity', 0);
		d3.selectAll(`.champ-rect`).attr('fill', 'black');
		d3.selectAll(`.champ-text`).attr('opacity', 0);
	}

	container.append(() => svg.node());

	// append citation for Basketball Reference

	return container.node();
}
