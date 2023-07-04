import * as d3 from 'd3';
import { autoType } from 'd3-dsv';
import { default as data } from '../data/dinosaurData.js';

export default async function DinosaurTree() {
	// console.log(data);

	const width = 1200;
	const margin = { top: 20, right: 20, bottom: 120, left: 20 };
	const startX = -252;
	const endX = -100;
	const beginTimeline = 120;

	const createTree = function* () {
		// Compute the tree height; this approach will allow the height of the
		// SVG to scale according to the breadth (width) of the tree layout.
		const root = d3.hierarchy(data);
		console.log(root);
		const dx = 10;
		const dy = 20;

		// Create a tree layout.
		const tree = d3.tree().nodeSize([dx, dy]);

		// Sort the tree and apply the layout.
		// root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
		const createTree = tree(root);
		console.log(createTree);

		let index = -1;
		root.eachAfter((d) => {
			if (d.data.name !== '') {
				d.x = index * dx;
				index++;
			} else {
				// console.log(d.children);
				let total = 0;
				for (const node of d.children) {
					// console.log(node.x);
					total += node.x;
				}
				d.x = total / d.children.length;
			}

			if (d.data.year) {
				d.y = ((startX - d.data.year) / (startX - endX)) * (width - beginTimeline) + beginTimeline;
			}
			// console.log(d.data.name, d.x, d.y);
		});

		// Compute the extent of the tree. Note that x and y are swapped here
		// because in the tree layout, x is the breadth, but when displayed, the
		// tree extends right rather than down.
		let x0 = Infinity;
		let x1 = -x0;
		root.each((d) => {
			if (d.x > x1) x1 = d.x;
			if (d.x < x0) x0 = d.x;
		});

		// Compute the adjusted height of the tree.
		const height = x1 - x0 + dx * 2;

		const x = d3
			.scaleLinear()
			.domain([-startX, -endX])
			.range([margin.left, width - beginTimeline]);

		const svg = d3
			.create('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom);

		const g = svg
			.append('svg')
			// .create('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [-dy / 3, x0 - dx, width, height])
			.attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

		const link = g
			.append('g')
			.attr('fill', 'none')
			.attr('stroke', '#555')
			.attr('stroke-opacity', 0.8)
			.attr('stroke-width', 3)
			.selectAll()
			.data(root.links())
			.join('path')
			// .attr(
			// 	'd',
			// 	d3
			// 		.linkHorizontal()
			// 		.x((d) => d.y)
			// 		.y((d) => d.x)
			// );
			.attr('stroke', (d) => {
				console.log(d);
				if (d.source.data.clade === 'Saurischia') {
					return '#569e6c';
				} else if (d.source.data.clade === 'Ornithischia') {
					return '#457aba';
				} else if (d.source.data.clade === 'Therapoda') {
					return '#bd5757';
				} else {
					return '#6b6b6b';
				}
			})
			.attr('d', (d) => {
				return `
                            M ${d.source.y},${d.source.x}
                            H ${d.source.y + 10}
                            V ${d.target.x}
                            H ${d.target.y}
                            `;
			});

		const node = g
			.append('g')
			.attr('stroke-linejoin', 'round')
			.attr('stroke-width', 3)
			.selectAll()
			.data(root.descendants())
			.join('g')
			.attr('transform', (d) => `translate(${d.y},${d.x})`);

		// node.append('circle').attr('fill', '#555').attr('r', 2.5);

		node.append('text')
			.attr('dy', '0.31em')
			.attr('x', (d) => (d.children ? -6 : 6))
			// .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
			.attr('text-anchor', (d) => 'start')
			.attr('class', 'node-text')
			.text((d) => d.data.name);
		// .clone(true)
		// .lower()
		// .attr('stroke', 'white');

		const xAxisG = svg
			.append('g')
			.attr('transform', `translate(${beginTimeline},${height + margin.top + margin.bottom - 45})`)
			.call(
				d3
					.axisBottom(x)
					.ticks(width / 100)
					.tickSizeOuter(5)
			)
			.append('text')
			.attr('class', 'axis-label')
			.attr('x', width / 2)
			.attr('y', 35)
			.attr('fill', 'black')
			.attr('text-anchor', 'middle')
			.text('Time (millions of years ago)');

		const eras = [
			{
				name: 'Triassic',
				start: -252,
				end: -201,
				subEras: [
					{ name: 'Early', start: -252, end: -247 },
					{ name: 'Middle', start: -247, end: -237 },
					{ name: 'Late', start: -237, end: -201 },
				],
			},
			{
				name: 'Jurassic',
				start: -201,
				end: -145,
				subEras: [
					{ name: 'Early', start: -201, end: -174 },
					{ name: 'Middle', start: -174, end: -164 },
					{ name: 'Late', start: -164, end: -145 },
				],
			},
			{
				name: 'Cretaceous',
				start: -145,
				end: -100,
				subEras: [{ name: 'Early', start: -145, end: -100 }],
			},
		];

		const subEras = [
			{ name: 'Early', start: -252, end: -247 },
			{ name: 'Middle', start: -247, end: -237 },
			{ name: 'Late', start: -237, end: -201 },
			{ name: 'Early', start: -201, end: -174 },
			{ name: 'Middle', start: -174, end: -164 },
			{ name: 'Late', start: -164, end: -145 },
			{ name: 'Early', start: -145, end: -100 },
		];

		const eraLabels = svg
			.append('g')
			.attr('transform', `translate(${beginTimeline + margin.left},${height + 30})`)
			.attr('class', 'eras')
			.attr('height', 70)
			.attr('width', width - beginTimeline);

		const eraText = eraLabels
			.selectAll('text')
			.data(eras)
			.enter()
			.append('text')
			.attr(
				'x',
				(d) => ((-startX + (d.start + d.end) / 2) / (endX - startX)) * (width - beginTimeline - margin.left)
			)
			.attr('dx', '-1.35em')
			.attr('y', 34)
			.text((d) => d.name)
			.attr('text-anchor', 'center')
			.attr('alignment-baseline', 'middle')
			.attr('font-size', '12px')
			.attr('fill', 'black');

		const eraBoxes = eraLabels
			.selectAll('rect')
			.data(eras)
			.enter()
			.append('rect')
			.attr('x', (d) => ((-startX + d.start) / (endX - startX)) * (width - beginTimeline - margin.left))
			.attr('y', -20)
			.attr('width', (d) => ((d.end - d.start) / (endX - startX)) * (width - beginTimeline - margin.left))
			.attr('height', 70)
			.attr('fill', 'none')
			// .attr('opacity', 0.1)
			.attr('stroke', 'grey')
			.attr('stroke-width', 2);

		const subEraLabels = svg
			.append('g')
			.attr('transform', `translate(${beginTimeline + margin.left},${height + 30})`)
			.attr('class', 'eras')
			.attr('height', 70)
			.attr('width', width - beginTimeline);

		const subEraText = subEraLabels
			.selectAll('text')
			.data(subEras)
			.enter()
			.append('text')
			.attr(
				'x',
				(d) => ((-startX + (d.start + d.end) / 2) / (endX - startX)) * (width - beginTimeline - margin.left)
			)
			.attr('dx', '-1.35em')
			.attr('y', 0)
			.text((d) => d.name)
			.attr('text-anchor', 'center')
			.attr('alignment-baseline', 'middle')
			.attr('font-size', '10px')
			.attr('fill', 'black');

		const subEraBoxes = subEraLabels
			.selectAll('rect')
			.data(subEras)
			.enter()
			.append('rect')
			.attr('x', (d) => ((-startX + d.start) / (endX - startX)) * (width - beginTimeline - margin.left))
			.attr('y', -20)
			.attr('width', (d) => ((d.end - d.start) / (endX - startX)) * (width - beginTimeline - margin.left))
			.attr('height', 35)
			.attr('fill', 'none')
			// .attr('opacity', 0.1)
			.attr('stroke', 'grey')
			.attr('stroke-width', 0.5);

		yield svg.node();
	};

	const mainContainer = document.createElement('div');
	mainContainer.setAttribute('class', 'main-container');
	const chartContainer = document.createElement('div');
	chartContainer.setAttribute('id', 'dino-tree-container');

	let dinoTree = createTree();
	document.body.appendChild(mainContainer);
	mainContainer.appendChild(chartContainer);
	for await (const chartNode of dinoTree) {
		// Clear the previous chart
		while (chartContainer.firstChild) {
			chartContainer.firstChild.remove();
		}
		// Append the new chart node to the container
		chartContainer.appendChild(chartNode);
	}
}
