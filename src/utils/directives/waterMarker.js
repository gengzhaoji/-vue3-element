/**
 * 水印指令
 * @module utils/directives/waterMarker
 */
export default {
    mounted: function (el, binding) {
        const { text, lineHeight, width, height, font, rotate, color, x, y, textAlign, textBaseline } = {
            lineHeight: 10,
            width: 200,
            height: 200,
            font: '20px 黑体',
            rotate: -20,
            color: 'rgba(100, 100, 100, 0.2)',
            x: 0,
            y: 100,
            textAlign: 'center',
            textBaseline: 'Middle',
            ...binding.value,
        };
        if (!text) return;
        const textArray = [].concat(text);
        const canvas = document.createElement('canvas');
        el.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;
        canvas.style.display = 'none';
        const ctx = canvas.getContext('2d');
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.font = font;
        ctx.fillStyle = color;
        const fontSize = parseInt(ctx.font) || 20;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        textArray.forEach((item, index) => {
            const y2 = y + (fontSize + lineHeight) * index;
            ctx.fillText(item, x, y2);
        });
        el.style.backgroundImage = 'url(' + canvas.toDataURL('image/png') + ')';
    },
};
