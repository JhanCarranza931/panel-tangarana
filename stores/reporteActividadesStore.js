import { format, addHours } from "date-fns";

export const useReporteActividadesStore = defineStore("reporteActividades", {
  state: () => ({
    actividades: [],
  }),
  actions: {
    async fetchActividades() {
      try {
        const response = await $fetch("/api/actividadreport");
        this.actividades = response;
      } catch (error) {
        console.error("Error al obtener actividades:", error.message);
        this.actividades = [];
        throw new Error("No se pudo cargar el reporte de actividades. Intente nuevamente.");
      }
    },
    async procesarActividades(fechaInicio, fechaFin) {
      try {
        if (!fechaInicio || !fechaFin) {
          throw new Error("Las fechas de inicio y fin son necesarias.");
        }

        // Ajustar las fechas al horario local de Perú (+5 horas UTC)
        const adjustToPeruTimezone = (dateString) =>
          addHours(new Date(dateString), 5);

        const startDate = adjustToPeruTimezone(`${fechaInicio}T00:00:00`);
        const endDate = adjustToPeruTimezone(`${fechaFin}T23:59:59`);

        console.log("Fecha inicio ajustada:", startDate);
        console.log("Fecha fin ajustada:", endDate);

        // Filtrar actividades dentro del rango
        const actividadesEnRango = this.actividades.filter((item) => {
          if (!item.fecha) return false;

          const fechaActividad = adjustToPeruTimezone(item.fecha);

          return fechaActividad >= startDate && fechaActividad <= endDate;
        });

        console.log("Actividades dentro del rango:", actividadesEnRango);

        return actividadesEnRango.map((item) => ({
          id: item.id,
          actividad: item.actividad,
          fecha: item.fecha
            ? format(adjustToPeruTimezone(item.fecha), "yyyy-MM-dd HH:mm:ss")
            : "No registrada",
          usuario: item.usuario
            ? `${item.usuario.nombre} ${item.usuario.apellido}`
            : "Usuario desconocido",
          estado: item.estado?.stado_actividad || "No asignado",
        }));
      } catch (error) {
        console.error("Error al procesar actividades:", error.message);
        throw new Error("Hubo un problema al procesar los datos. Intente nuevamente.");
      }
    },
  },
});
