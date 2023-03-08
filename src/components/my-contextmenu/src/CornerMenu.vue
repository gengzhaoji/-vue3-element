<template>
    <ul class="my-contextmenu__menu" ref="$el">
        <Item v-for="(item, index) in items" :key="index" v-bind="item" @click="handleClick(item, $event)" @submenu="handleActive">
            <template #default="{ children, active }">
                <CornerMenu v-if="children && active" :items="children" :class="menuClass" />
            </template>
        </Item>
    </ul>
</template>

<script setup name="CornerMenu">
import Item from './MenuItem.vue';

const wrapper = inject('wrapper', {}),
    props = defineProps({
        items: {
            type: Array,
            default() {
                return [];
            },
        },
    });

let left = ref(false),
    bottom = ref(false),
    menuClass = computed(() => ({
        'is-left': left.value,
        'is-bottom': bottom.value,
    }));

function handleClick(item, e) {
    /**
     * 点击菜单项时触发
     * @event click
     * @param {Object} item 菜单项数据
     * @param {Object} vm 菜单项实例
     */
    wrapper.emit('click', item, e);
    wrapper.visible = false;
}
function handleActive(vm) {
    const itemRect = unref(vm).getBoundingClientRect();
    const targetRect = unref(wrapper.triggerTarget).getBoundingClientRect();
    const x = itemRect.x + itemRect.width;
    const y = itemRect.y;
    bottom.value = rect.value.height + y - targetRect.top >= targetRect.height;
    left.value = rect.value.width + x - targetRect.left >= targetRect.width;
}

let rect = ref(),
    $el = shallowRef();
onMounted(() => {
    nextTick(() => {
        rect.value = unref($el).getBoundingClientRect();
    });
});
defineExpose({ rect });
</script>
