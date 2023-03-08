<template>
    <li v-if="divider" ref="$el" class="my-contextmenu__divider"></li>

    <li v-else ref="$el" class="my-contextmenu__item" :class="classes" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" @click.prevent.stop="handleClick">
        <div class="my-contextmenu__left">
            <span class="my-contextmenu__icon">
                <MyIcon v-if="iconProps" v-bind="iconProps"></MyIcon>
            </span>
            <span class="my-contextmenu__label">{{ label }}</span>
        </div>
        <div class="my-contextmenu__right">
            <span v-if="info" class="my-contextmenu__info">{{ info }}</span>
            <el-icon v-if="hasChild" class="my-contextmenu__arrow"><CaretRight /></el-icon>
        </div>
        <slot v-if="active" :active="active" :children="children"></slot>
    </li>
</template>

<script setup>
const props = defineProps({
        icon: [String, Object],
        label: String,
        info: String,
        disabled: Boolean,
        divider: Boolean,
        children: Array,
    }),
    iconProps = computed(() => {
        if (!props.icon) return null;
        return typeof props.icon === 'object'
            ? props.icon
            : {
                  icon: props.icon,
              };
    }),
    hasChild = computed(() => props?.children?.length > 0),
    classes = computed(() => ({
        'is-disabled': props.disabled,
        'is-has-child': hasChild.value,
    }));

let active = ref(false);

const emit = defineEmits(['submenu', 'click']),
    $el = ref();

function handleMouseEnter(e) {
    active.value = true;
    if (hasChild.value) {
        nextTick(() => {
            emit('submenu', $el);
        });
    }
}

function handleMouseLeave(e) {
    active.value = false;
}

function handleClick(e) {
    if (props.disabled) return;
    emit('click', $el);
}
</script>
