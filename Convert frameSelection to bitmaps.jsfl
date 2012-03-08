/////////////////////////////////
// @author David 'Oldes' Oliva
// oldes@amanita-design.net
//
// Converts content of frame selection into bitmaps.
/////////////////////////////////

var lay, f, layer, layerNum;
var document = fl.getDocumentDOM();
var timeline = document.getTimeline();
var selectedFrames = timeline.getSelectedFrames();
var resultLayer = null;
var resultLayerNum;
if(selectedFrames.length>0){
	
	var layerStart = selectedFrames[0];
	var layerEnd   =(selectedFrames.length>3)?selectedFrames[selectedFrames.length-3]:layerStart;
	var frameStart = selectedFrames[1];
	var frameEnd   = selectedFrames[2];
	var layersUnlocked = [];
	
	//CREATE RESULT LAYER
	//if not exists already..
	/*for(lay=0; lay<timeline.layers.length; lay++){
		if(timeline.layers[lay].name == "__BITMAP_RESULTS__") {
			resultLayer = timeline.layers[lay];
			resultLayerNum = lay;
			break;
		}
	}*/
	if(!resultLayer){
		timeline.currentLayer = layerEnd;
		resultLayerNum = timeline.addNewLayer("__BITMAP_RESULTS__", "normal", false);
		resultLayer = timeline.layers[resultLayerNum];
	}
	resultLayer.locked = true;
	
	//STORE LAYER's LOCKS
	var layerLocks = [];
	for(lay=0; lay<timeline.layers.length; lay++){
		layer = timeline.layers[lay];
		layerLocks.push(layer.locked);
		if(lay < layerStart || lay > layerEnd) layer.locked = true;
	}
	
	//GET UNLOCKED LYERS INSIDE SELECTION
	for(lay=layerStart;lay<=layerEnd;lay++){
		layer = timeline.layers[lay];
		if(!layer.locked) layersUnlocked.push(lay);
	}
	var numLayers = layersUnlocked.length;
	
	//CREATE KEYFRAMES WHERE NEEDED
	var keyFramesToConvert = [];
	for(f=frameStart;f<frameEnd;f++){
		var emptyFrames = 0;
		var keyFrames = 0;
		for(lay=0; lay<numLayers; lay++){
			layer = timeline.layers[layersUnlocked[lay]];
			timeline.currentLayer = layersUnlocked[lay];
			frame = layer.frames[f];
			if(frame) {
				if(frame.tweenType!="none"){
					if(f<layer.frames.length-1){
						timeline.convertToKeyframes(f,f);
					}
					frame.tweenType = "none";
					timeline.currentFrame = f;
				}
				
				//break any movie instances
				for(i=0;i<frame.elements.length;i++){
					if(frame.elements[i].elementType == "instance"){
						if(frame.duration>1){
							//if the movie was on frame sequence, create a keyFrame here
							//so the animations inside the movie still will be in next frames
							timeline.convertToKeyframes(f,f);
						}
						timeline.currentLayer = layersUnlocked[lay];
						timeline.setSelectedFrames(f,f, true);
						document.breakApart();
					}
				}
				
				if(frame.elements.length==0) {
					emptyFrames++;
				} else if(f==frame.startFrame){//is keyframe
					keyFrames++;
				}
			}
		}
		if(
			f==frameStart || //convert to bitmap keyFrames if it's selection start frame
			keyFrames>0
		){
			keyFramesToConvert.push(f);
			if(
				f==frameStart || //convert to keyFrames if it's selection start frame
				keyFrames<(numLayers-emptyFrames)
			){
				for(lay=0; lay<numLayers; lay++){
					layerNum = layersUnlocked[lay];
					frame = layer.frames[f];
					if(frame){
						layer = timeline.layers[layerNum];
						if(f!=layer.frames[f].startFrame){//isn't keyframe
							timeline.currentFrame = f;
							timeline.currentLayer = layerNum;
							timeline.setSelectedFrames([layerNum, f, f], true);
							timeline.convertToKeyframes();
						}
					}
				}
			}
		}
	}
	var cf = frameEnd;
	for(lay=0; lay<numLayers; lay++){
		var layerNum = layersUnlocked[lay];
		layer = timeline.layers[layerNum];
		frame = layer.frames[cf];
		if(frame && cf!=frame.startFrame){//isn't keyframe
			timeline.currentFrame = cf;
			timeline.currentLayer = layerNum;
			timeline.convertToKeyframes();
		}
	}
	// prepare empty keyframes in the result layer
	timeline.currentLayer = resultLayerNum;
	for(f=0; f<keyFramesToConvert.length; f++){
		cf = keyFramesToConvert[f];
		if(cf>0) timeline.convertToBlankKeyframes(cf);
	}
	
	// convert keyframes into bitmaps and paste result into resultLayer 
	for(f=keyFramesToConvert.length-1; f>=0; f--){
		cf = keyFramesToConvert[f];
		timeline.currentLayer = layersUnlocked[0];
		timeline.currentFrame = cf;
		
		document.selectAll();
		if(document.selection.length>0){
			document.convertSelectionToBitmap();
			
			document.selectAll();
			document.clipCut();
			
			resultLayer.locked = false;
			timeline.currentLayer = resultLayerNum;
			timeline.currentFrame = cf;
			
			document.clipPaste(true);
			
			resultLayer.locked = true;
		}
	}
	
	//RESTORE LAYER's LOCKS
	for(lay=0; lay<layerLocks.length; lay++){
		timeline.layers[lay].locked = layerLocks[lay];
	}
	resultLayer.locked = false;
	
	//ADD EMPTY FRAME AFTER LAST RESULT FRAME (if not last)
	timeline.currentLayer = resultLayerNum;
	
	if(frameEnd<resultLayer.frames.length-1){
		
		timeline.currentFrame = frameEnd;
		timeline.convertToBlankKeyframes();
	}
}
