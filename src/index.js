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
    //console.log("enlacesF: ", enlaces);
    const app = {};

    nodos.map((nodo) => {
        app[nodo.id] = 0;
    });
    enlaces.map((link) => {
        //console.log("## LINK  ##");
        //console.log(link);
        if (link.source.id == undefined){
            app[link.source] += 1;
            app[link.target] += 1;
        }
        else{
            app[link.source.id] += 1;
            app[link.target.id] += 1;
        }
        
        
    });
    
    return app;
}

// Inicializa botones y selectores
const nombre_cuenta = document.querySelector("select#nombre_cuenta");
const agregar_cuenta = d3.select("#botones").append("button").text("añadir");
const recalcular = d3.select("#boton_recalcular").append("button").text("Recalcular red");
const slider_conexiones = document.getElementById("slider_conexiones");
const numero_conexiones = document.getElementById("numero_conexiones");


// contenedor de lista de cuentas seleccionadas
const lista_cuentas = document.getElementById("lista");
// DB para filtros
const cuentas_seleccionadas = [];


const iniciarSimulacion = (nodos, enlaces) => {
    console.log("## Nodos ")
    console.log(nodos);
    console.log(enlaces);
    nodos.sort(function(a, b){
        //console.log(a);
        if(a.data.full_name < b.data.full_name) { return -1; }
        if(a.data.full_name > b.data.full_name) { return 1; }
        return 0;
    })
    nodos.forEach((nodo) => {
        const option = document.createElement("option");
        if (nodo.data != undefined){
            option.value = nodo.id;
            option.innerHTML = nodo.data.full_name + " | @"+ nodo.data.username;
            nombre_cuenta.appendChild(option);
            
        }
        
    });
    
    //Filtrar nodos

    const conexiones = conexiones_del_nodo(nodos, enlaces);
    //console.log("!!! Conexiones !!!")
    //console.log(conexiones);
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
            
            //console.log(d.path[0].__data__)
            Tooltip
            .html("@" + d.path[0].__data__.name +"<br> Conexiones: " + conexiones[d.path[0].__data__.id])
            .style("left", (d.path[0].cx.baseVal.value+70) + "px")
            .style("top", (d.path[0].cy.baseVal.value+20) + "px");
            
            
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
        .attr("id", (d) => d.id.toString())
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
    
    // Busqueda y foco sobre un elemento en específico
    nombre_cuenta.onchange = () =>  {
        circulo  = svg.selectAll("circle")
                .style("stroke", "white")
                .filter((d,i) => d.id === parseInt(nombre_cuenta.value))
                .style("stroke", "red");
    };
    function buscar_nombre(nodo_id){
        var n = "";
        nodos.forEach(element => {
            //console.log("Nodo para buscar nombre: ")
            //console.log(element);
            if(element.id == nodo_id){
                //console.log(element.data.username);
                n = element.data.username;
            }
        })
        return n
    };
    // Boton para añadir al filtro
    agregar_cuenta.on("click", (e) => {
        // añade id de la cuenta seleccionada
        if (cuentas_seleccionadas.includes(nombre_cuenta.value) == false){
            cuentas_seleccionadas.push(nombre_cuenta.value);
            //console.log("Cuentas: "+ cuentas_seleccionadas);
            const texto = document.createElement("p");
            const nombre = "@"+buscar_nombre(nombre_cuenta.value);
            
            texto.textContent = nombre.toString();
            // Boton para quitar del filtro
            texto.addEventListener('click', (event) => {
                let index = cuentas_seleccionadas.indexOf(event.target.value);
                cuentas_seleccionadas.splice(index, 1);
                event.target.remove()
            } )
            lista_cuentas.append(texto);
        }
        
    
    })
    
    // Boton para recalcular red
    recalcular.on("click", (e) => {
        const source_nodes = [];

        function verificar_enlaces(value, i){
            
            if (cuentas_seleccionadas.includes((value.target.id).toString()) || cuentas_seleccionadas.includes((value.source.id).toString())){
                return value
            }
        };
        function verificar_nodos(value, i){
            if (source_nodes.includes((value.id))){
                return value
            }
        };
        enlaces_filtrados = enlaces.filter(verificar_enlaces);
        //console.log(enlaces_filtrados);
        enlaces_filtrados.forEach((enlace) =>
            {
                source_nodes.push(enlace.source.id);
                source_nodes.push(enlace.target.id);
                //console.log(source_nodes)
            }
            
        );
        cuentas_seleccionadas.map((e) => {source_nodes.push(parseInt(e))});
        //console.log("cuentas"+source_nodes);
        d3.selectAll("svg > *").remove();
        nodos_filtrados = nodos.filter(verificar_nodos);
        iniciarSimulacion(nodos_filtrados, enlaces_filtrados);
        
        

    })

    // Slider de conexiones
    // input de numero de conexiones
    
    
  })
  .catch((error) => {
    console.log(error);
  });
