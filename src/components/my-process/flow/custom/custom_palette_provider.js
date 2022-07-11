import {
    assign
} from 'min-dash';
import { getDi } from './util/ModelUtil';

export default function CustomPaletteProvider(palette, create, elementFactory, translate) {
    this._palette = palette;
    this._create = create;
    this._elementFactory = elementFactory;
    this._translate = translate;

    palette.registerProvider(this)
}

CustomPaletteProvider.$inject = [
    'palette',
    'create',
    'elementFactory',
    'translate'
]

CustomPaletteProvider.prototype.getPaletteEntries = function(element) {
    var actions = {},
        create = this._create,
        elementFactory = this._elementFactory,
        translate = this._translate

    function createAction(type, group, className, title, options) {

        function createListener(event) {
            var shape = elementFactory.createShape(assign({ type: type }, options));

            if (options) {
                var di = getDi(shape);
                di.isExpanded = options.isExpanded;
            }

            create.start(event, shape);
        }

        var shortType = type.replace(/^bpmn:/, '');

        return {
            group: group,
            className: className,
            title: title || translate('Create {type}', { type: shortType }),
            action: {
                dragstart: createListener,
                click: createListener
            }
        };
    }

    assign(actions, {
        'create.start-event': createAction(
            'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none',
            translate('Create StartEvent')
        ),
        'create.end-event': createAction(
            'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none',
            translate('Create EndEvent')
        ),
        'create.task': createAction(
            'bpmn:UserTask', 'activity', 'bpmn-icon-task',
            translate('Create Task')
        )
    });

    return actions;
}