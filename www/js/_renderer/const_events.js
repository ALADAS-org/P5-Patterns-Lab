// =====================================================================================
// ================================   const_events.js   ================================
// =====================================================================================
"use strict";
    
const VIEW_TOGGLE_DEVTOOLS               = "View/ToggleDevTools";
const REQUEST_LOG_2_MAIN                 = "request:log2main";
const FromMain_DID_FINISH_LOAD           = "FromMain:did-finish-load";
const FromMain_SET_RENDERER_VALUE        = "FromMain:Set/RendererValue";

if (typeof exports === 'object') {	
	exports.VIEW_TOGGLE_DEVTOOLS               = VIEW_TOGGLE_DEVTOOLS	
    exports.REQUEST_LOG_2_MAIN                 = REQUEST_LOG_2_MAIN
	exports.FromMain_DID_FINISH_LOAD           = FromMain_DID_FINISH_LOAD
	exports.FromMain_SET_RENDERER_VALUE        = FromMain_SET_RENDERER_VALUE
} // exports of 'const_events.js'