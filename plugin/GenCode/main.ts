import { FairyEditor } from 'csharp';
import { genCode } from './GenCode';

function onPublish(handler: FairyEditor.PublishHandler) {
    if (!handler.genCode) return;
    handler.genCode = false; //prevent default output

    console.log('Handling gen code in plugin');
    genCode(handler); //do it myself
}

function onDestroy() {
    //do cleanup here
}

export { onPublish, onDestroy };