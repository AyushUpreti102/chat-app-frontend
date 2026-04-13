<template>
    <div class="mobile-footer row justify-around items-center">

        <q-btn flat round icon="chat" />
        <q-btn flat round icon="search" />

        <q-btn round color="primary" icon="add" class="fab-btn" />

        <q-btn flat round icon="notifications" />
        <q-btn flat round icon="person" />

    </div>
</template>

<style scoped>
.mobile-footer {
    position: sticky;
    bottom: 0;
    height: 60px;
    background: white;
    border-top: 1px solid #eee;
    z-index: 10;
}

/* Floating center button */
.fab-btn {
    position: absolute;
    top: -20px;
}
</style>