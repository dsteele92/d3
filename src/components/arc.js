import * as d3 from 'd3';

export default function Arc(data) {
	const margin = { top: 20, right: 20, bottom: 20, left: 20 };
	const width = 400;
	const height = 400;

	const svg = d3
		.create('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);

	const g = svg
		.append('g')
		// .attr('transform', `translate(${margin.left},${margin.top})`)
		// put in middle of svg
		.attr('transform', `translate(${width / 2},${height / 2})`);

	const arc = d3
		.arc()
		.innerRadius(120)
		.outerRadius(180)
		.padRadius(300)
		.padAngle(2 / 300)
		.cornerRadius(5);

	// create a pie generator with the passed in data
	const pie = d3
		.pie()
		.value((d) => d.count)
		.sort(null);

	// create the data for the pie
	const pieData = pie(data);

	// append the arc
	g.selectAll('path')
		.data(pieData)
		.enter()
		.append('path')
		.attr('d', arc)
		// make the fill changing rainbow colors
		.attr('fill', (d, i) => d3.interpolateRainbow(i / data.length))
		.attr('stroke', 'white')
		.attr('stroke-width', 1);

	// add the name and count in the middle of each arc path
	g.selectAll('.label')
		.data(pieData)
		.enter()
		.append('text')
		.attr('class', 'label')
		.attr('transform', (d) => `translate(${arc.centroid(d)})`)
		.attr('text-anchor', 'middle')
		.text((d) => d.data.name)
		.attr('font-size', '10px')
		.attr('alignment-baseline', 'middle')
		// add the count below the name
		.append('tspan')
		.attr('x', 0)
		.attr('dy', '1.5em')
		.text((d) => d.data.count)
		.attr('font-size', '8px')
		.attr('fill', 'white')
		.attr('alignment-baseline', 'middle');

	return svg.node();
}
