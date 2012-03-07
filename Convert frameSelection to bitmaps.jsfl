/////////////////////////////////
// @author David 'Oldes' Oliva
// oldes@amanita-design.net
//
// Converts content of frame selection into bitmaps.
/////////////////////////////////

var lay, f, layer;
var document = fl.getDocumentDOM();
var timeline = document.getTimeline();
var selectedFrames = timeline.getSelectedFrames();

if(selectedFrames.length>0){
	
	var layerStart = selectedFrames[0];
	var layerEnd   =(selectedFrames.length>3)?selectedFrames[selectedFrames.length-3]:layerStart;
	var frameStart = selectedFrames[1];
	var frameEnd   = selectedFrames[2];
	var layersUnlocked = [];
	
	//CREATE RESULT LAYER
	timeline.currentLayer = layerEnd;
	var resultLayerNum = timeline.addNewLayer("Bitmaps", "normal", false);
	var resultLayer = timeline.layers[resultLayerNum];
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
			frame = layer.frames[f];
			if(frame.elements.length==0) {
				emptyFrames++;
			} else if(f==frame.startFrame){//is keyframe
				keyFrames++;
			}
		}
		if(
			f==frameStart || //convert to keyFrames if it's selection start frame
			keyFrames>0
		){
			keyFramesToConvert.push(f);
			if(
				f==frameStart || //convert to keyFrames if it's selection start frame
				keyFrames<(numLayers-emptyFrames)
			){
				for(lay=0; lay<numLayers; lay++){
					var layerNum = layersUnlocked[lay];
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

	for(f=keyFramesToConvert.length-1; f>=0; f--){
		var cf = keyFramesToConvert[f];
		timeline.currentLayer = layersUnlocked[0];
		timeline.currentFrame = cf;
		
		document.selectAll();
		document.convertSelectionToBitmap();
		
		document.selectAll();
		document.clipCut();
		
		resultLayer.locked = false;
		timeline.currentLayer = resultLayerNum;
		timeline.convertToBlankKeyframes(cf);
		timeline.currentFrame = cf;
		
		document.clipPaste(true);
		
		resultLayer.locked = true;
	}
	
	//RESTORE LAYER's LOCKS
	for(lay=0; lay<layerLocks.length; lay++){
		timeline.layers[lay].locked = layerLocks[lay];
	}
	resultLayer.locked = false;
	
	//ADD EMPTY FRAME AFTER LAST RESULT FRAME
	timeline.currentLayer = resultLayerNum;
	timeline.currentFrame = frameEnd+1;
	timeline.convertToBlankKeyframes();
}
