/**
	Controls the trace of a body relative to another. Traces are not orbit lines, they are the path trace of a body relative to another
*/

define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/graphics3d/Tracer',
		'three'
	], 
	function(ns, $, Tracer) {
		'use strict';

		//number of tracing vertices. It was previously taken directly from the orbit's size, but a constant number is more convenient
		var N_VERTICES = 1000;

		var TM = {
			init : function(containerParam){
				this.bodies3d = [];
				this.container = containerParam;
			},

			setTraceFrom : function(lookFromBody, lookAtBody){				
				this.removeTracers();
				this.addTracer(lookAtBody, lookFromBody);
			},

			addTracer : function(tracingBody, traceFromBody) {
				if(!traceFromBody || !tracingBody) return;
				var tracer = tracingBody.tracer;
				if(!tracer) return;
				tracer.setTraceFrom(traceFromBody);
				tracer.getNew();
				this.container.add(tracer.getDisplayObject());
			},

			removeTracers : function(){
				var container = this.container;
				
				_.each(this.bodies3d, function(body3d){
					if(body3d.celestial.forceTrace) return;
					var tracer = body3d.tracer;
					//clear all traces first
					if(!tracer) return;
					container.remove(tracer.getDisplayObject());
					
				});
			},

			draw : function() {
				if(this.deferredForceTraceBody) {
					this.deferredForceTraceBody.map(function(tracingBody){
						var traceFromBody = ns.U.getBody(tracingBody.celestial.traceRelativeTo || tracingBody.celestial.relativeTo).getBody3D();
						this.addTracer(tracingBody, traceFromBody);
					}.bind(this));
					this.deferredForceTraceBody = null;
				}
			},

			addBody : function(body3d){

				this.bodies3d.push(body3d);

				if(body3d.celestial.isCentral) return;

				var tracer = Object.create(Tracer);
				tracer.init(body3d.celestial.traceColor || body3d.celestial.color, N_VERTICES, body3d.celestial.name);
				body3d.tracer = tracer;

				if(body3d.celestial.forceTrace) {
					this.deferredForceTraceBody = this.deferredForceTraceBody || [];
					this.deferredForceTraceBody.push(body3d);
				}
				
			},

			kill : function(){
			}
		};

		return TM;

	});