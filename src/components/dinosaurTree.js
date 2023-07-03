import * as d3 from 'd3';
import { autoType } from 'd3-dsv';
import { default as data } from '../data/dinosaurData.js';

export default async function DinosaurTree() {
	console.log(data);

	const width = 1500;

	const createTree = function* () {
		// Compute the tree height; this approach will allow the height of the
		// SVG to scale according to the breadth (width) of the tree layout.
		const root = d3.hierarchy(data);
		const dx = 20;
		const dy = width / (root.height + 2);

		// Create a tree layout.
		const tree = d3.tree().nodeSize([dx, dy]);

		// Sort the tree and apply the layout.
		// root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
		tree(root);

		let index = -1;
		root.eachBefore((d) => {
			++index;
			let setXAxis = index * 5;

			if (d.depth > 0 && index > 0) {
				setXAxis = setXAxis - 10;
			}

			if (d.depth > 1 && index > 0) {
				setXAxis = setXAxis - 10;
			}

			if (d.depth > 2 && index > 0) {
				setXAxis = setXAxis - 10;
			}

			d.x = setXAxis;
			// d.y = d.depth * 20;
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

		const svg = d3
			.create('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [-dy / 3, x0 - dx, width, height])
			.attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

		const link = svg
			.append('g')
			.attr('fill', 'none')
			.attr('stroke', '#555')
			.attr('stroke-opacity', 0.4)
			.attr('stroke-width', 1.5)
			.selectAll()
			.data(root.links())
			.join('path')
			// .attr(
			// 	'd',
			// 	d3
			// 		.linkVertical()
			// 		.source((d) => [d.source.y, d.source.x])
			// 		.target((d) => [d.target.y, d.target.x])
			// 		.x((d) => d[0])
			// 		.y((d) => d[1])
			//     );
			// .attr(
			// 	'd',
			// 	d3
			// 		.linkHorizontal()
			// 		.x((d) => d.y)
			// 		.y((d) => d.x)
			// );
			.attr(
				'd',
				(d) => `
    M ${d.source.y},${d.source.x}
    H ${(d.target.y + d.source.y) / 2}

    V ${d.target.x}
    H ${d.target.y}
    V ${d.target.x}
  `
			);

		const node = svg
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
			.attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
			.text((d) => d.data.name)
			.clone(true)
			.lower()
			.attr('stroke', 'white');

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
