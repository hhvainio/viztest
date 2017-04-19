//THIS IS THE JAVA SCRIPT THAT CONTROLS THE VISUALIZER
//This needs to be in the public folder (or somewhere similar)
//Try to get data from your Node.js database to here.

//Node.js Agent Based Model-visualizer test.


// Much of this code comes from Node.js Chess App https://www.blend4web.com/en/forums/topic/2524/
// https://github.com/WillWelker/node_chess
// Much of that code comes from the B4W example project Cartoon Interior https://www.blend4web.com/en/community/article/66/

"use strict"

// register the application module
b4w.register("ftest_b4w", function(exports, require) {

// import modules used by the app (not all of these are currently used)
var m_app    = require("app");
var m_cam    = require("camera");
var m_cont   = require("container");
var m_ctl    = require("controls");
var m_data   = require("data");
var m_mat	 = require("material");
var m_math   = require("math");
var m_mouse  = require("mouse");
var m_obj    = require("objects");
var m_phy    = require("physics");
var m_quat   = require("quat");
var m_rgb	 = require("rgb");
var m_scenes = require("scenes");
var m_time   = require('time');
var m_trans  = require("transform");
var m_util   = require("util");
var m_rgba 	 = require("rgba");
var m_version = require("version");
var m_cfg     = require("config");
var m_anchors = require("anchors");


var m_quat = require("quat");

var _enable_camera_controls = true;
var _socket = io();

//var net = require('net');

//set the fastems subsystem names for the color changer function
var cc = "CC";
var sc = "SC";
var ls1 = "LS1";
var ls2 = "LS2";
var mc1 ="MC1";
var mc2 = "MC2";
//and for testing purposes, mock statuscolors (which would come from python in reality!): 
var statusred = "Red";
var statusblue = "Blue";
var statusgreen = "Green";
var statusyellow = "Yellow";

var pythondata; //for testing
var pythondata2; //for testing different stuff simultaneously
var pydata2;
var outofthedict;


exports.init = function() { //creates the main canvas container in the website
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        physics_enabled: false,
        alpha: false,
		autoresize: true,
        background_color: [0.0, 0.0, 0.0]
		
    });
};

function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }
    load();
}

//THIS IS FOR GETTING DATA FROM THE NODE.JS SERVER! Not sure if it works.
 
function init_netwok(){ 
    console.log("init_network");
	
	_socket = io.connect();

      _socket.on('connection', function () {
		});

		
	_socket.on('pydata', function(pydata) {
		//pydata2 = pydata.toString();
		console.log('Received pydata' + pydata + typeof pydata);
			
		//outofthedict = pydata["MC 1"];
		//console.log('Got this out of the dict: ' + outofthedict + typeof outofthedict);
		
		change_subsystem_color(cc, pydata["CC"]["StatusColor"]);
		change_subsystem_color(sc, pydata["SC"]["StatusColor"]);
		change_subsystem_color(ls1, pydata["LS 1"]["StatusColor"]);
		change_subsystem_color(ls2, pydata["LS 2"]["StatusColor"]);
		change_subsystem_color(mc1, pydata["MC 1"]["StatusColor"]);
		change_subsystem_color(mc2, pydata["MC 2"]["StatusColor"]);
		change_subsystem_status_text(pydata["CC"], "fms_cc_anchor_child");
		change_subsystem_status_text(pydata["SC"], "fms_sc_anchor_child");
		change_subsystem_status_text(pydata["LS 1"],"fms_ls1_anchor_child");
		change_subsystem_status_text(pydata["LS 2"], "fms_ls2_anchor_child");
		change_subsystem_status_text(pydata["MC 1"], "fms_mc1_anchor_child");
		change_subsystem_status_text(pydata["MC 2"], "fms_mc2_anchor_child");
	
	}); 

	//loop the SOME() function indefinitely... not working right now?
  //m_time.set_timeout(function(){init_network()}, 1/15);
	
}


//THIS LOADS THE BLENDER 3D-MODEL, WHICH IS PORTED FROM BLENDER AS JSON
function load() {
    m_data.load("ftestviz_v2.json", load_cb);
	}

//THIS LOADS THE OTHER STUFF
function load_cb(data_id) {
    m_app.enable_camera_controls();
	init_netwok();
	
	//CUSTOM ANCHORS
  /*   var fms_sc_anchor = m_scenes.get_object_by_name("Stacker Crane");
    m_anchors.attach_move_cb(fms_sc_anchor, function(x, y, appearance, obj, elem) {
        var anchor_elem = document.getElementById("fms_sc_anchor");
        anchor_elem.style.left = x + "px";
        anchor_elem.style.top = y + "px";

        if (appearance == "visible")
            anchor_elem.style.visibility = "visible";
        else
            anchor_elem.style.visibility = "hidden";
		
		anchor_elem.addEventListener("click", function() {
			if (fms_sc_anchor_child.style.display == "block") {
				fms_sc_anchor_child.style.display = "none";	
			} else {
				fms_sc_anchor_child.style.display = "block";
			}
		
			}, false);
		
    });
	 */
	custom_anchors("Cell Controller", "fms_cc_anchor", "fms_cc_anchor_child")
	custom_anchors("Stacker Crane", "fms_sc_anchor", "fms_sc_anchor_child")
	custom_anchors("Machine Cell 1", "fms_mc1_anchor", "fms_mc1_anchor_child")
	custom_anchors("Machine Cell 2", "fms_mc2_anchor", "fms_mc2_anchor_child")
	custom_anchors("Loading Station 1", "fms_ls1_anchor", "fms_ls1_anchor_child")
	custom_anchors("Loading Station 2", "fms_ls2_anchor", "fms_ls2_anchor_child")
}

function custom_anchors(blender_object, http_anchor_name, http_anchor_child){
	
	var s_anchor = m_scenes.get_object_by_name(blender_object);
    m_anchors.attach_move_cb(s_anchor, function(x, y, appearance, obj, elem) {
        var anchor_elem = document.getElementById(http_anchor_name);
		var anchor_child_elem = document.getElementById(http_anchor_child);
        anchor_elem.style.left = x + "px";
        anchor_elem.style.top = y + "px";

        if (appearance == "visible")
            anchor_elem.style.visibility = "visible";
        else
            anchor_elem.style.visibility = "hidden";
		
		anchor_elem.addEventListener("click", function() {
			if (anchor_child_elem.style.display == "block") {
				anchor_child_elem.style.display = "none";	
			} else {
				anchor_child_elem.style.display = "block";
			}
		
			}, false);
		
    });
	
	
}


//THIS FUNCTION TELLS THE 3D-MODEL TO CHANGE THE SUBYSTEM MODEL COLORS
function change_subsystem_color(subsystem,statuscolor) {
	
	var subsys = m_scenes.get_object_by_name(subsystem); //get the object names from the 3d-model
	var materialName=m_mat.get_materials_names(subsys); //get the object material names
	//console.log("If clause sees color " + statuscolor)
	//define the colors NOTICE THE CAPITAL LETTERS IN THE COLOR NAMES!!!
	if(statuscolor.indexOf("Red") >= 0){var col1=200;var col2=0;var col3=0;}
	else if(statuscolor.indexOf("Green") >= 0){var col1=0;var col2=200;var col3=0;}
	else if(statuscolor.indexOf("Blue") >= 0){var col1=0;var col2=0;var col3=200;}
	else if(statuscolor.indexOf("Yellow") >= 0){var col1=200;var col2=200;var col3=0;}
	else {var col1=0;var col2=0;var col3=0; console.log("I see a subsytem / I want to paint it black...");}
	
	m_mat.set_diffuse_color(subsys, materialName[0], [col1,col2,col3]); //set the color for the material in question
	//console.log("Tried change_subsystem_color function with " + statuscolor + typeof statuscolor)
}

//THIS FUNCTION CHANGES THE FMS SUBSYSTEM STATUS TEXT IN THE ANNOTATION BOXES
function change_subsystem_status_text(status_dict, http_anchor_child){
	
	var status_update = "Order ID: " + status_dict["OrderId"] + "</br>" + "Status: " + status_dict["Status"] + "</br>" + "Status Changed: " + status_dict["StatusChanged"] + "</br>" + "Max Alert Level: " + status_dict["MaxAlertLevel"];
	
	document.getElementById(http_anchor_child).innerHTML = status_update;
	
}


});
// import the app module and start the app by calling the init method
b4w.require("ftest_b4w").init();

