import {
    assign,
    forEach,
    isArray
} from 'min-dash';

import {
    is
} from '../util/ModelUtil';

import {
    isEventSubProcess
} from '../util/DiUtil';

import {
    isAny
} from '../util/ModelingUtil';

import {
    hasPrimaryModifier
} from 'diagram-js/lib/util/Mouse';

import CustomPopupMenu from '../popup-menu';

export default function CustomContextPadProvider(
    config, injector, eventBus,
    contextPad, modeling, elementFactory,
    connect, create, popupMenu,
    canvas, rules, translate) {

    config = config || {};

    contextPad.registerProvider(this);

    this._contextPad = contextPad;
    this._modeling = modeling;
    this._elementFactory = elementFactory;
    this._connect = connect;
    this._create = create;
    this._popupMenu = popupMenu;
    this._canvas = canvas;
    this._rules = rules;
    this._translate = translate;

    if (config.autoPlace !== false) {
        this._autoPlace = injector.get('autoPlace', false);
    }

    eventBus.on('create.end', 250, function(event) {
        var context = event.context,
            shape = context.shape;

        if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
            return;
        }

        var entries = contextPad.getEntries(shape);

        if (entries.replace) {
            entries.replace.action.click(event, shape);
        }
    });
}

CustomContextPadProvider.$inject = [
    'config.contextPad',
    'injector',
    'eventBus',
    'contextPad',
    'modeling',
    'elementFactory',
    'connect',
    'create',
    'popupMenu',
    'canvas',
    'rules',
    'translate'
];


CustomContextPadProvider.prototype.getContextPadEntries = function(element) {

    var contextPad = this._contextPad,
        modeling = this._modeling,
        elementFactory = this._elementFactory,
        connect = this._connect,
        create = this._create,
        popupMenu = this._popupMenu,
        canvas = this._canvas,
        rules = this._rules,
        autoPlace = this._autoPlace,
        translate = this._translate;

    var actions = {};

    if (element.type === 'label') {
        return actions;
    }

    var businessObject = element.businessObject;

    function startConnect(event, element) {
        connect.start(event, element);
    }

    function removeElement(e) {
        modeling.removeElements([ element ]);
    }

    function getReplaceMenuPosition(element) {

        var Y_OFFSET = 5;

        var diagramContainer = canvas.getContainer(),
            pad = contextPad.getPad(element).html;

        var diagramRect = diagramContainer.getBoundingClientRect(),
            padRect = pad.getBoundingClientRect();

        var top = padRect.top - diagramRect.top;
        var left = padRect.left - diagramRect.left;

        var pos = {
            x: left,
            y: top + padRect.height + Y_OFFSET
        };

        return pos;
    }

    function appendAction(type, className, title, options) {

        if (typeof title !== 'string') {
            options = title;
            title = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
        }

        function appendStart(event, element) {

            var shape = elementFactory.createShape(assign({ type: type }, options));
            create.start(event, shape, {
                source: element
            });
        }


        var append = autoPlace ? function(event, element) {
            var shape = elementFactory.createShape(assign({ type: type }, options));

            autoPlace.append(element, shape);
        } : appendStart;


        return {
            group: 'model',
            className: className,
            title: title,
            action: {
                dragstart: appendStart,
                click: append
            }
        };
    }

    if (is(businessObject, 'bpmn:FlowNode')) {
        if (isEventType(businessObject, 'bpmn:BoundaryEvent', 'bpmn:CompensateEventDefinition')) {
            assign(actions, {
                'append.compensation-activity':
                    appendAction(
                        'bpmn:UserTask',
                        'bpmn-icon-task',
                        translate('Append compensation activity'),
                        {
                            isForCompensation: true
                        }
                    )
            });
        } else{
            if (!is(businessObject, 'bpmn:EndEvent') &&
                !businessObject.isForCompensation &&
                !isEventType(businessObject, 'bpmn:IntermediateThrowEvent', 'bpmn:LinkEventDefinition') &&
                !isEventSubProcess(businessObject)) {

                assign(actions, {
                    'append.end-event': appendAction(
                        'bpmn:EndEvent',
                        'bpmn-icon-end-event-none',
                        translate('Append EndEvent')
                    ),
                    'append.append-task': appendAction(
                        'bpmn:UserTask',
                        'bpmn-icon-task',
                        translate('Append Task')
                    )
                });
            }
        }
    }

    if (!popupMenu.isEmpty(element, 'bpmn-replace')) {

        // Replace menu entry
        assign(actions, {
            'replace': {
                group: 'edit',
                className: 'bpmn-icon-screw-wrench',
                title: translate('Change type'),
                action: {
                    click: function(event, element) {

                        var position = assign(getReplaceMenuPosition(element), {
                            cursor: { x: event.x, y: event.y }
                        });

                        popupMenu.open(element, 'bpmn-replace', position);
                    }
                }
            }
        });
    }

    if (
        isAny(businessObject, [
            'bpmn:FlowNode',
            'bpmn:InteractionNode',
            'bpmn:DataObjectReference',
            'bpmn:DataStoreReference',
        ])
    ) {
        assign(actions, {
            'connect': {
                group: 'connect',
                className: 'bpmn-icon-connection-multi',
                title: translate(
                    'Connect using ' +
                    (businessObject.isForCompensation
                        ? ''
                        : 'Sequence/MessageFlow or ') +
                    'Association'
                ),
                action: {
                    click: startConnect,
                    dragstart: startConnect,
                },
            },
        });
    }

    // delete element entry, only show if allowed by rules
    var deleteAllowed = rules.allowed('elements.delete', { elements: [ element ] });

    if (isArray(deleteAllowed)) {

        // was the element returned as a deletion candidate?
        deleteAllowed = deleteAllowed[0] === element;
    }

    if (deleteAllowed) {
        assign(actions, {
            'delete': {
                group: 'edit',
                className: 'bpmn-icon-trash',
                title: translate('Remove'),
                action: {
                    click: removeElement
                }
            }
        });
    }

    return actions;
};


// helpers /////////

function isEventType(eventBo, type, definition) {

    var isType = eventBo.$instanceOf(type);
    var isDefinition = false;

    var definitions = eventBo.eventDefinitions || [];
    forEach(definitions, function(def) {
        if (def.$type === definition) {
            isDefinition = true;
        }
    });

    return isType && isDefinition;
}
