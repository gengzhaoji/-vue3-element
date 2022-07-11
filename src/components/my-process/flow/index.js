import Modeler from 'bpmn-js/lib/Modeler';

import inherits from 'inherits';

import CustomModule from './custom';

import zhTranslate from './lang/zhTranslate';
import bpmnModdle from './config/bpmn.json';
import flowableModdle from './config/flowable.json';
import SelfDescriptor from './config/SelfDescriptor.json';

export default function FlowModeler(options) {
    const zhTranslateModule = {
        translate: ['value', zhTranslate],
    };
    options.additionalModules = [zhTranslateModule];
    options.moddleExtensions = {
        rundow: SelfDescriptor,
    };
    options.prefix = 'rundow';
    Modeler.call(this, options);
}

inherits(FlowModeler, Modeler);

FlowModeler.prototype._modules = [].concat(FlowModeler.prototype._modules, [CustomModule]);
