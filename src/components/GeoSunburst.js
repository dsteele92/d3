import * as d3 from 'd3';
import { autoType } from 'd3-dsv';

export default async function GeoSunburst() {
	let dataPop = { name: 'world', children: [] };
	let dataArea = { name: 'world', children: [] };
	const continents = new Map();
	continents.set('AF', 'Africa');
	continents.set('AS', 'Asia');
	continents.set('EU', 'Europe');
	continents.set('NA', 'North America');
	continents.set('SA', 'South America');
	continents.set('OC', 'Oceania');
	continents.set('AN', 'Antarctica');

	try {
		const response = await fetch('http://127.0.0.1:8081/data/countriesData.tsv');
		const csvData = await response.text();
		const parsed = d3.tsvParse(csvData, autoType);
		// console.log('parsed:', parsed);

		const grouped = d3.group(parsed, (d) => d.continent);
		// filter out null values
		// data = grouped.get(null).filter((d) => d.value !== null);
		// console.log('grouped:', grouped);
		for (const [continent, countries] of grouped.entries()) {
			// console.log(continent, countries);
			let currentPop = { name: continents.get(continent), children: [] };
			let total = 0;
			for (const country of countries) {
				total += country.population;
			}
			let contCreated = false;
			let cont2Created = false;
			let cont3Created = false;
			for (const country of countries) {
				if (country.population > total * 0.015) {
					currentPop.children.push({ name: country.name, value: country.population });
				} else {
					if (!contCreated) {
						currentPop.children.unshift({ name: 'cont...', children: [] });
						contCreated = true;
					}
					if (country.population > total * 0.001) {
						currentPop.children[0].children.push({ name: country.name, value: country.population });
					} else {
						if (!cont2Created) {
							currentPop.children[0].children.unshift({ name: 'cont...', children: [] });
							cont2Created = true;
						}
						if (country.population > total * 0.00005) {
							currentPop.children[0].children[0].children.push({
								name: country.name,
								value: country.population,
							});
						} else {
							if (!cont3Created) {
								currentPop.children[0].children[0].children.unshift({ name: 'cont...', children: [] });
								cont3Created = true;
							}
							currentPop.children[0].children[0].children[0].children.push({
								name: country.name,
								value: country.population,
							});
						}
					}
				}
			}
			dataPop.children.push(currentPop);

			let currentArea = { name: continents.get(continent), children: [] };
			contCreated = false;
			cont2Created = false;
			cont3Created = false;
			total = 0;
			for (const country of countries) {
				total += country.areaInSqKm;
			}
			for (const country of countries) {
				if (country.areaInSqKm > total * 0.015) {
					currentArea.children.push({ name: country.name, value: country.areaInSqKm });
				} else {
					if (!contCreated) {
						currentArea.children.unshift({ name: 'cont...', children: [] });
						contCreated = true;
					}
					if (country.areaInSqKm > total * 0.001) {
						currentArea.children[0].children.push({ name: country.name, value: country.areaInSqKm });
					} else {
						if (!cont2Created) {
							currentArea.children[0].children.unshift({ name: 'cont...', children: [] });
							cont2Created = true;
						}
						if (country.areaInSqKm > total * 0.00005) {
							currentArea.children[0].children[0].children.push({
								name: country.name,
								value: country.areaInSqKm,
							});
						} else {
							if (!cont3Created) {
								currentArea.children[0].children[0].children.unshift({ name: 'cont...', children: [] });
								cont3Created = true;
							}
							currentArea.children[0].children[0].children[0].children.push({
								name: country.name,
								value: country.areaInSqKm,
							});
						}
					}
				}
			}
			dataArea.children.push(currentArea);
		}
		console.log('data:', dataPop);
	} catch (error) {
		console.log('Error loading the CSV file:', error);
		const errorDiv = d3.create('div').text('Error loading the CSV file').attr('class', 'error');

		return errorDiv.node();
	}

	const partition = (data) => {
		const root = d3
			.hierarchy(data)
			.sum((d) => d.value)
			.sort((a, b) => b.value - a.value)
			// if the name is 'cont...' then place last in hierarchy
			.eachBefore((d) => (d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name))
			.eachAfter((d) => {
				if (d.data.name === 'cont...') {
					d.parent.children.push(d);
					d.parent.children.splice(d.parent.children.indexOf(d), 1);
				}
			});

		return d3.partition().size([2 * Math.PI, root.height + 1])(root);
	};

	const color = d3.scaleOrdinal(d3.quantize(d3.interpolateSpectral, dataPop.children.length + 1));
	const format = d3.format(',d');
	const width = 1000;
	const radius = 155.33333333333334;
	const arc = d3
		.arc()
		.startAngle((d) => d.x0)
		.endAngle((d) => d.x1)
		.padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
		.padRadius(radius * 1.5)
		.innerRadius((d) => d.y0 * radius)
		.outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));

	const chart = function* (sortBy = 'Population') {
		console.log('chart');
		let root;
		if (sortBy === 'Population') {
			root = partition(dataPop);
		} else {
			root = partition(dataArea);
		}

		root.each((d) => (d.current = d));

		const svg = d3.create('svg').attr('viewBox', [0, 0, width, width]).style('font', '10px sans-serif');

		const g = svg.append('g').attr('transform', `translate(${width / 2},${width / 2})`);

		const tooltip = d3
			.select('body')
			.append('div')
			.attr('id', 'tooltip-sunburst')
			.style('position', 'absolute')
			.style('visibility', 'hidden');

		const path = g
			.append('g')
			.selectAll('path')
			.data(root.descendants().slice(1))
			.join('path')
			.attr('fill', (d) => {
				while (d.depth > 1) d = d.parent;
				// return 'red';
				return color(d.data.name);
			})
			.attr('fill-opacity', (d) => (arcVisible(d.current) ? (d.children ? 0.8 : 0.6) : 0))
			.attr('pointer-events', (d) => (arcVisible(d.current) ? 'auto' : 'none'))

			.attr('d', (d) => arc(d.current));

		path.filter((d) => d.children)
			.style('cursor', 'pointer')
			.on('click', clicked);

		// path.append('title').text(
		// 	(d) => `${d.data.name}\n${sortBy}: ${format(d.value)}${sortBy === 'Area' ? ' sq km' : ''}`
		// );

		path.on('mouseover', function (e, d) {
			if (d.data.name === 'cont...') return;
			d3.select(this).attr('opacity', 0.9); // Reduce opacity on mouseover
			// console.log(d);
			// console.log(d.data);
			tooltip
				.style('visibility', 'visible') // Show tooltip on mouseover
				.style('left', `${event.pageX}px`) // Position tooltip relative to mouse cursor
				.style('top', `${event.pageY + 18}px`)
				.append('h4')
				.text(`${d.data.name}`)
				// .style('font-weight', 'bold')
				.append('h4')
				.text(`${sortBy}: ${format(d.value)}${sortBy === 'Area' ? ' sq km' : ''}`);
		})
			.on('mousemove', function (e, d) {
				if (d.data.name === 'cont...') return;
				// d3.select(this).attr('opacity', 1); // Restore opacity on mouseout
				tooltip
					.style('left', `${event.pageX}px`) // Position tooltip relative to mouse cursor
					.style('top', `${event.pageY + 18}px`);
			})
			.on('mouseout', function (e, d) {
				if (d.data.name === 'cont...') return;
				d3.select(this).attr('opacity', 1); // Restore opacity on mouseout
				tooltip.style('visibility', 'hidden'); // Hide tooltip on mouseout
				tooltip.selectAll('h4').remove();
			});

		const label = g
			.append('g')
			.attr('pointer-events', 'none')
			.attr('text-anchor', 'middle')
			.style('user-select', 'none')
			.selectAll('text')
			.data(root.descendants().slice(1))
			.join('text')
			.attr('dy', '0.35em')
			.attr('fill-opacity', (d) => +labelVisible(d.current))
			.attr('transform', (d) => labelTransform(d.current))
			.text((d) => d.data.name);

		const parent = g
			.append('circle')
			.datum(root)
			.attr('r', radius)
			.attr('fill', 'none')
			.attr('pointer-events', 'all')
			.attr('id', 'center-circle')
			.on('click', clicked);

		function clicked(event, p) {
			parent.datum(p.parent || root);

			root.each(
				(d) =>
					(d.target = {
						x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
						x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
						y0: Math.max(0, d.y0 - p.depth),
						y1: Math.max(0, d.y1 - p.depth),
					})
			);

			const t = g.transition().duration(750);

			// Transition the data on all arcs, even the ones that aren’t visible,
			// so that if this transition is interrupted, entering arcs will start
			// the next transition from the desired position.
			path.transition(t)
				.tween('data', (d) => {
					const i = d3.interpolate(d.current, d.target);
					return (t) => (d.current = i(t));
				})
				.filter(function (d) {
					return +this.getAttribute('fill-opacity') || arcVisible(d.target);
				})
				.attr('fill-opacity', (d) => (arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0))
				.attr('pointer-events', (d) => (arcVisible(d.target) ? 'auto' : 'none'))

				.attrTween('d', (d) => () => arc(d.current));

			label
				.filter(function (d) {
					return +this.getAttribute('fill-opacity') || labelVisible(d.target);
				})
				.transition(t)
				.attr('fill-opacity', (d) => +labelVisible(d.target))
				.attrTween('transform', (d) => () => labelTransform(d.current));

			const center = document.getElementById('center-circle');
			if (p.data.name !== 'world') {
				center.classList.add('back-cursor');
			} else {
				center.classList.remove('back-cursor');
			}
		}

		function arcVisible(d) {
			return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
		}

		function labelVisible(d) {
			return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
		}

		function labelTransform(d) {
			const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
			const y = ((d.y0 + d.y1) / 2) * radius;
			return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
		}

		yield svg.node();
	};

	const mainContainer = document.createElement('div');
	mainContainer.setAttribute('class', 'main-container');
	const chartContainer = document.createElement('div');
	chartContainer.setAttribute('id', 'geo-chart-container');

	const sortLabel = document.createElement('h4');
	sortLabel.setAttribute('class', 'label');
	sortLabel.setAttribute('id', 'sort-label');
	sortLabel.innerText = 'Sort by: ';
	const sortSelect = document.createElement('select');
	sortSelect.setAttribute('id', 'sort-select');
	sortSelect.innerHTML = `
    <option value="Population">Population</option>
    <option value="Area (sq km)">Area (sq km)</option>
    `;
	sortSelect.addEventListener('change', async (e) => {
		console.log(e.target.value);
		if (e.target.value === 'Population') {
			sunburst = chart('Population');
		} else {
			sunburst = chart('Area');
		}
		for await (const chartNode of sunburst) {
			// Clear the previous chart
			while (chartContainer.firstChild) {
				chartContainer.firstChild.remove();
			}
			// Append the new chart node to the container
			chartContainer.appendChild(chartNode);
		}
	});
	mainContainer.appendChild(sortLabel);
	mainContainer.appendChild(sortSelect);

	let sunburst = chart();
	document.body.appendChild(mainContainer);
	mainContainer.appendChild(chartContainer);
	for await (const chartNode of sunburst) {
		// Clear the previous chart
		while (chartContainer.firstChild) {
			chartContainer.firstChild.remove();
		}
		// Append the new chart node to the container
		chartContainer.appendChild(chartNode);
	}
}
