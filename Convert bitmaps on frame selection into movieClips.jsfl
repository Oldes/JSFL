/**
 * Converts bitmaps on frame selection into movieClips.
 * @icon	{iconsURI}Design/picture/picture_go.png
 * @author David 'Oldes' Oliva
 * oldes@amanita-design.net
 */
 
(function(){
 	xjsfl.init(this);
	clear();
	var context = Context.create();
	var lay, f, layer, frame;
	var document = fl.getDocumentDOM();
	var timeline = document.getTimeline();
	var selectedFrames = timeline.getSelectedFrames();
	
	function safeRename(item, name, prefix){
		var counter, newName;
		if(prefix==undefined) prefix = "";
		var newName = prefix + name;
		while($library.itemExists(newName)){
			counter = (counter==undefined)?1:counter+1;
			newName = prefix + name + "_" + counter;
		}
		item.name = newName;
	}

	if(selectedFrames.length>0){
		
		var layerStart = selectedFrames[0];
		var layerEnd   =(selectedFrames.length>3)?selectedFrames[selectedFrames.length-3]:layerStart;
		var frameStart = selectedFrames[1];
		var frameEnd   = selectedFrames[2];

		for(f=frameStart;f<frameEnd;f++){
			for(lay=layerStart;lay<=layerEnd;lay++){
				layer = timeline.layers[lay];
				timeline.currentLayer = lay;
				frame = layer.frames[f];
				if(frame) {
					timeline.currentFrame = f;
					for(i=0;i<frame.elements.length;i++){
						var el = frame.elements[i];
						if(el.libraryItem.itemType == "bitmap"){
							trace("ToMovie: "+el.libraryItem.name)
							document.selectNone();
							document.selection = [el];
							var mov = document.convertToSymbol('movie clip', '', 'top left');
							if(mov){
								safeRename(mov,el.libraryItem.shortName,"_MC_");
							}
						}
					}
				}
			}
		}
	}
	context.goto();

})()