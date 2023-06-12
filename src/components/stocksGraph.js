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

	const container = d3.create('div').attr('class', 'container').attr('id', 'stocks-graph-container');

	const margin = { top: 20, right: 20, bottom: 20, left: 20 };
	const width = 400;
	const height = 300;

	const svg = d3
		.create('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		// add id stocks-graph
		.attr('id', 'stocks-graph');

	const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

	const x = d3
		.scaleUtc()
		.domain(d3.extent(data, (d) => d.date))
		// make the domain for the year 2009
		// .domain([new Date(2009, 0, 1), new Date(2010, 0, 1)])
		.range([margin.left, width - margin.right]);

	const y = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.upper)])
		.nice()
		.range([height - margin.bottom, margin.top]);

	// using htl create a line chart
	const closeLine = d3
		.line()
		.defined((d) => !isNaN(d.close))
		.x((d) => x(d.date))
		.y((d) => y(d.close));

	const lowerLine = d3
		.line()
		.defined((d) => !isNaN(d.lower))
		.x((d) => x(d.date))
		.y((d) => y(d.lower));
	const upperLine = d3
		.line()
		.defined((d) => !isNaN(d.upper))
		.x((d) => x(d.date))
		.y((d) => y(d.upper));

	const range = d3
		.area()
		.defined((d) => !isNaN(d.upper))
		.x((d) => x(d.date))
		.y0((d) => y(d.lower))
		.y1((d) => y(d.upper));

	const reveal = (path) =>
		path
			.transition()
			.duration(5000)
			.ease(d3.easeLinear)
			.attrTween('stroke-dasharray', function () {
				const length = this.getTotalLength();
				return d3.interpolate(`0,${length}`, `${length},${length}`);
			});

	function xAxis(g, x) {
		g.attr('transform', `translate(0,${height - margin.bottom})`).call(
			d3
				.axisBottom(x)
				.ticks(width / 80)
				.tickSizeOuter(0)
		);
	}

	function yAxis(g, y) {
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
	const closePath = g
		.append('path')
		.attr('d', closeLine(data))
		.attr('fill', 'none')
		.attr('stroke', 'steelblue')
		.attr('stroke-width', 1)
		.attr('id', 'close');
	const lowerPath = g
		.append('path')
		.attr('d', lowerLine(data))
		.attr('fill', 'none')
		.attr('stroke', 'red')
		.attr('stroke-width', 1)
		.attr('id', 'lower');
	const upperPath = g
		.append('path')
		.attr('d', upperLine(data))
		.attr('fill', 'none')
		.attr('stroke', 'green')
		.attr('stroke-width', 1)
		.attr('id', 'upper');
	// .call(reveal);
	const rangePath = g
		.append('path')
		.attr('d', range(data))
		.attr('fill', 'steelblue')
		.attr('opacity', 0.5)
		.attr('id', 'range');
	// g.append('path')
	// 	.attr('d', area.lineY1()(data))
	// 	.attr('fill', 'none')
	// 	.attr('stroke', 'green')
	// 	.attr('stroke-width', 1);
	// g.append('path').attr('d', area.lineY0()(data)).attr('fill', 'none').attr('stroke', 'red').attr('stroke-width', 1);
	const xAxisG = g.append('g').call(xAxis, x);
	const yAxisG = g.append('g').call(yAxis, y);

	const options = data.map((d) => d.date.getFullYear()).filter((v, i, a) => a.indexOf(v) === i);
	options.unshift('All Years');

	container.append(() => svg.node());
	container
		.append('select')
		.attr('class', 'select')
		.on('change', function () {
			if (this.value === 'All Years') {
				const xDomain = d3.extent(data, (d) => d.date);
				updateYear(xDomain);
				return;
			}
			const year = d3.select(this).property('value');
			const xDomain = [new Date(year, 0, 1), new Date(Number(year) + 1, 0, 1)];
			updateYear(xDomain);
		})
		// make the years the options
		.selectAll('option')
		.data(options)
		.enter()
		.append('option')
		.text((d) => d);

	const graphOptions = ['Close', 'Upper', 'Lower', 'Range'];
	container
		.append('checkbox')
		.attr('class', 'checkbox-container')
		.selectAll('input')
		.data(graphOptions)
		.enter()
		.each(function (d) {
			d3.select(this)
				.append('label')
				.attr('for', d)
				.text(d)
				.each(function (d) {
					d3.select(this)
						.append('input')
						.attr('type', 'checkbox')
						// make checked by default
						.property('checked', true)
						.attr('class', 'checkbox-option')
						.attr('id', d)
						.attr('name', d)
						.attr('value', d)
						.on('change', function () {
							const checked = d3.select(this).property('checked');
							const value = d3.select(this).property('value');
							toggleGraphElement(value.toLowerCase());
						});
				});
		});

	const updateYear = (xDomain) => {
		const t = svg.transition().duration(750);
		x.domain(xDomain);
		xAxisG.transition(t).call(xAxis, x);
		closePath.transition(t).attr('d', closeLine(data));
		lowerPath.transition(t).attr('d', lowerLine(data));
		upperPath.transition(t).attr('d', upperLine(data));
		rangePath.transition(t).attr('d', range(data));
	};

	const toggleGraphElement = function (id) {
		const element = d3.select(`#${id}`);
		const isHidden = element.classed('hidden');
		element.classed('hidden', !isHidden);
	};

	return Object.assign(container.node(), updateYear);
}
