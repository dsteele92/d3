import * as d3 from 'd3';
import { autoType } from 'd3-dsv';
import { html } from 'htl';
// import stocksData from '../data/stocksData.csv';
// const d3 = require('d3-dsv');

export default async function StocksGraph() {
	let data;
	await fetch('http://127.0.0.1:8080/data/stocksData.csv')
		.then((response) => response.text())
		.then((csvData) => {
			data = d3.csvParse(csvData, autoType);
			console.log(data); // Access the parsed CSV data

			// Continue with your data manipulation or visualization logic
		})
		.catch((error) => {
			console.log('Error loading the CSV file:', error);
		});

	const margin = { top: 20, right: 20, bottom: 20, left: 20 };
	const width = 400;
	const height = 300;

	const svg = d3
		.create('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);

	const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

	const x = d3
		.scaleUtc()
		.domain(d3.extent(data, (d) => d.date))
		.range([margin.left, width - margin.right]);

	const y = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.upper)])
		.nice()
		.range([height - margin.bottom, margin.top]);

	// using htl create a line chart
	const line = d3
		.line()
		.defined((d) => !isNaN(d.upper))
		.x((d) => x(d.date))
		.y((d) => y(d.upper));

	function xAxis(g) {
		g.attr('transform', `translate(0,${height - margin.bottom})`).call(
			d3
				.axisBottom(x)
				.ticks(width / 80)
				.tickSizeOuter(0)
		);
		// .call((g) => g.select('.domain').remove());
	}

	function yAxis(g) {
		g.attr('transform', `translate(${margin.left},0)`)
			.call(d3.axisLeft(y).ticks(height / 40))
			.call((g) => g.select('.domain').remove())
			.call((g) =>
				g
					.select('.tick:last-of-type text')
					.clone()
					.attr('x', 3)
					.attr('text-anchor', 'start')
					.attr('font-weight', 'bold')
					.text(data.y)
			);
	}

	// append the path and the axes
	g.append('path').attr('d', line(data)).attr('fill', 'none').attr('stroke', 'steelblue').attr('stroke-width', 1.5);
	g.append('g').call(xAxis);
	g.append('g').call(yAxis);

	return svg.node();
}
