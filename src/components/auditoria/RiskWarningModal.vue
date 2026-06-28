<script setup lang="ts">
const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Dialog
    :visible="true"
    header="Aviso de Análise de Risco"
    :modal="true"
    style="width: 35rem"
    :breakpoints="{ '640px': '95vw' }"
    @update:visible="$emit('cancel')"
  >
    <p>A utilização de dados de NC na definição da amostragem está alinhada à abordagem de análise de risco da ISO/IEC 17025. A não utilização pode reduzir a sensibilidade da auditoria a áreas críticas.</p>
    <p>Deseja prosseguir sem utilizar o histórico de não conformidades?</p>
    <template #footer>
      <Button label="Cancelar" severity="secondary" @click="$emit('cancel')" />
      <Button label="Confirmar e Prosseguir" @click="$emit('confirm')" />
    </template>
  </Dialog>
</template>
