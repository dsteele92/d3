import * as d3 from 'd3';
import { html } from 'htl';

export default function CircleSlider() {
	const width = 400;
	const height = 300;

	const svg = d3
		.create('svg')
		.attr('width', width)
		.attr('height', height)
		// add class circle-slider to the svg
		.attr('class', 'circle-slider');

	const color = d3.scaleSequential().domain([0, 100]).interpolator(d3.interpolateReds);

	// append a circle to the svg
	svg.append('circle')
		.attr('cx', width / 2)
		.attr('cy', height / 2)
		.attr('r', 50)
		.attr('fill', () => color(50))
		// add class 'circle' to the circle
		.attr('class', 'circle')
		// add id 'circle1' to the circle
		.attr('id', 'circle1');

	// add text to middle of circle
	svg.append('text')
		.attr('x', width / 2)
		.attr('y', height / 2)
		.attr('text-anchor', 'middle')
		.attr('alignment-baseline', 'middle')
		.attr('font-size', '16px')

		.attr('fill', 'black')
		.text('50')
		// add id 'circle-text' to the text
		.attr('id', 'circle-text');

	const foreignObject = svg
		.append('foreignObject')
		.attr('width', '100%')
		.attr('height', 50)
		.attr('x', 0)
		.attr('y', height - 30);

	// foreignObject
	// 	.append('xhtml:input')
	// 	.attr('type', 'range')
	// 	.attr('width', '100%')
	// 	.attr('min', 0)
	// 	.attr('max', 100)
	// 	.attr('value', 50)
	// 	.attr('id', 'slider')
	// 	.attr('class', 'slider');

	// use htl to create a range input element
	const input = html`<input type="range" min="0" max="100" value="50" id="slider1" class="slider" />`;
	// append the range input element to the foreignObject
	foreignObject.node().appendChild(input);

	// make the range input width 100%
	// input.style.width = '100%';
	// add an event listener to the range input
	input.addEventListener('input', function () {
		// get the value of the range input
		const value = d3.select(this).property('value');
		// change the radius of the circle to the value of the range input
		d3.select('#circle1')
			.attr('r', value)
			.attr('fill', () => color(value));
		d3.select('#circle-text').text(value);
	});

	return svg.node();
}
