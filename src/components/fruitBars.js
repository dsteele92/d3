import * as d3 from 'd3';
import { html } from 'htl';

export default function FruitBars(data) {
	const margin = { top: 20, right: 20, bottom: 20, left: 20 };
	const width = 400 - margin.left - margin.right;
	const height = 300 - margin.top - margin.bottom;

	const x = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.count)])
		.range([margin.left, width - margin.right]);

	const y = d3
		.scaleBand()
		.domain(data.map((d) => d.name))
		.range([margin.top, height - margin.bottom])
		.padding(0.1)
		.round(true);

	const color = d3
		.scaleSequential()
		.domain([0, d3.max(data, (d) => d.count)])
		.interpolator(d3.interpolateGreens);

	// const svg = d3.create('svg').attr('width', width).attr('height', height);

	const svg = d3
		.create('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);

	const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

	g.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.attr('y', (d) => y(d.name))
		.attr('x', x(0))
		.attr('width', (d) => x(d.count) - x(0))
		.attr('height', y.bandwidth())
		.attr('fill', (d) => color(d.count));

	g.selectAll('text')
		.data(data)
		.enter()
		.append('text')
		.attr('y', (d) => y(d.name) + y.bandwidth() / 2)
		.attr('x', x(0) - 20)
		.attr('dy', '0.35em')
		.text((d) => d.name)
		.attr('font-size', '12px')
		.attr('alignment-baseline', 'middle');

	// add the count at the end of each bar
	g.selectAll('.label')
		.data(data)
		.enter()
		.append('text')
		.attr('class', 'label')
		.attr('x', (d) => x(d.count))
		.attr('y', (d) => y(d.name) + y.bandwidth() / 2)
		.attr('dy', '0.35em')
		.attr('dx', 5)
		.text((d) => d.count)
		.attr('font-size', '12px')
		.attr('alignment-baseline', 'middle')
		.attr('fill', 'grey');

	// add the x Axis
	g.append('g')
		.attr('transform', `translate(0,${margin.top})`)
		.call(d3.axisTop(x).ticks(width / 80))
		.attr('font-size', '12px')
		// make grey
		.attr('color', 'grey')
		// remove the domain line
		.select('.domain')
		.remove();

	return svg.node();
}
