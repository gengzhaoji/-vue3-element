export default {
    mounted(el, binding) {
        el.addEventListener('click', () => {
            if (!el.disabled) {
                el.disabled = true;
                el.className = el.className + ' is-disabled';
                setTimeout(() => {
                    el.className = el.className.replace(' is-disabled', '');
                    el.disabled = false;
                }, binding.value || 500);
            }
        });
    },
};
