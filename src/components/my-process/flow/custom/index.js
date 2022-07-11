import Modeler from 'bpmn-js/lib/Modeler'

import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider'
import CustomPaletteProvider from './custom_palette_provider'

import CustomContextPadModule from './context-pad'

export default {
    __depends__: [Modeler, CustomContextPadModule],
    __init__: ['paletteProvider'],
    paletteProvider: ['type', CustomPaletteProvider]
}