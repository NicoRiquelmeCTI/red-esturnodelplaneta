//se define el tamaño del SVG
const width = d3.select('#svg').node().getBoundingClientRect().width;
const height = d3.select('#svg').node().getBoundingClientRect().height;
const margin = {
    top: 10,
    bottom: 10,
    right: 10,
    left: 10,
};

// se define el SVG
const svg = d3
    .select("#svg")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


const conexiones_del_nodo = (nodos, enlaces) => {
    const app = {};

    nodos.map((nodo) => {
        app[nodo.id] = 0;
    });
    enlaces.map((link) => {
        app[link.source] += link.value;
        app[link.target] += link.value;
    });
    return app;
}

const iniciarSimulacion = (nodos, enlaces) => {
    const conexiones = conexiones_del_nodo(nodos, enlaces);
    const simulacion = d3
    //investigar
        .forceSimulation(nodos)
        .force("enlaces", d3.forceLink(enlaces).id((d) => d.id))
        .force("carga", d3.forceManyBody())
        .force("centro", d3.forceCenter(width/2, height/2));
    //investigar
    const scale = d3.scaleOrdinal(d3.schemeCategory10); 
    const circleScale = d3.scaleLinear()
        .domain([Math.min(...Object.values(conexiones)), Math.max(...Object.values(conexiones))])
        .range([3, 10]);

    // Tooltip para mostrar info del nodo
    const Tooltip = d3.select("#svg").append("div")
        .style("opacity",0)
        .attr("class", "tooltip")

    const mouseover = function(d) {
        
            Tooltip
            .transition()
            .duration(200)
            .style("opacity", .9)
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
        }
    const mousemove = function(d) {
            
            console.log(d.path[0].__data__)
            Tooltip
            .html("@" + d.path[0].__data__.name +"<br> Conexiones: " + conexiones[d.path[0].__data__.id])
            .style("left", (d.path[0].cx.baseVal.value+50) + "px")
            .style("top", (d.path[0].cy.baseVal.value+50) + "px");
            
            
            //console.log(d3.select(this))

        }
        var mouseleave = function(d) {
            Tooltip
            .style("opacity", 0)
            d3.select(this)
            .style("stroke", "#fff")
            .style("opacity", 0.8)
        }

    // Evento de arrastrar un nodo
    const drag = (sim) => {
        const dragstarted = (event) => {
            if (!event.active) sim.alphaTarget(0.5).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        };
        const dragged = (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          };
          
        const dragended = (event) => {
            if (!event.active) sim.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          };
            
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };

    const lineas = svg
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(enlaces)
        .join("line")
        .attr("stroke-width", (d) => Math.sqrt(d.value));

    const circulos = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodos)
        .join("circle")
        .attr("r", (d) => circleScale(conexiones[d.id]))
        .attr("fill", (d) => scale(d.group))
        .call(drag(simulacion))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    simulacion.on("tick", () => {
        circulos
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
        lineas
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);
    });
};

d3.json("src/relations.json")
  .then((datos) => {
    const nodos = datos.nodes;
    const enlaces = datos.links;
    iniciarSimulacion(nodos, enlaces);
  })
  .catch((error) => {
    console.log(error);
  });
