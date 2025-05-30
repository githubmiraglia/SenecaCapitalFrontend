import React, { useState } from "react";
import { IconButton, Modal, Box, Typography } from "@mui/material";
import {
  DateCalendar,
  PickersDay,
  PickersDayProps,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { Evento } from "../types/Types";
import "../css/Calendario.css";

interface CalendarioProps {
  eventos: Evento[];
  onSelectArquivo?: (url: string) => void;
}

const Calendario: React.FC<CalendarioProps> = ({ eventos = [], onSelectArquivo }) => {
  const [currentYear, setCurrentYear] = useState<number>(dayjs().year());
  const [hoveredEvento, setHoveredEvento] = useState<Evento | null>(null);

  const isEventDay = (date: Dayjs): Evento | undefined => {
    return eventos?.find((evento) =>
      dayjs(evento.data, "DD/MM/YYYY").isSame(date, "day")
    );
  };

  const renderDay = (props: PickersDayProps) => {
    const evento = isEventDay(props.day);
    return (
      <Box
        onMouseEnter={() => evento && setHoveredEvento(evento)}
        onMouseLeave={() => setHoveredEvento(null)}
      >
        <PickersDay
          {...props}
          sx={{
            backgroundColor: evento ? "#e53935" : "white",
            color: evento ? "white" : undefined,
            borderRadius: "50%",
          }}
        />
      </Box>
    );
  };

  const months = Array.from({ length: 12 }, (_, i) =>
    dayjs(`${currentYear}-${i + 1}-01`)
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box className="year-navigation">
        <IconButton onClick={() => setCurrentYear(currentYear - 1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6">{currentYear}</Typography>
        <IconButton onClick={() => setCurrentYear(currentYear + 1)}>
          <ArrowForward />
        </IconButton>
      </Box>

      <Box className="calendar-grid-no-grid">
        {months.map((month) => (
          <Box key={month.toString()} className="calendar-cell">
            <DateCalendar
              views={["day"]}
              view="day"
              value={month}
              onChange={() => {}}
              readOnly
              referenceDate={month}
              showDaysOutsideCurrentMonth
              slots={{ day: renderDay }}
            />
          </Box>
        ))}
      </Box>

      <Modal open={!!hoveredEvento} onClose={() => setHoveredEvento(null)}>
        <Box
          className="evento-modal"
          onMouseEnter={() => {}}
          onMouseLeave={() => setHoveredEvento(null)}
        >
          <Typography variant="body1">{hoveredEvento?.descricao}</Typography>
          {hoveredEvento?.arquivo && (
            <Typography
              variant="body2"
              className="modal-link"
              onClick={() => onSelectArquivo?.(hoveredEvento.arquivo!)}
            >
              Clique aqui para ver documento
            </Typography>
          )}
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default Calendario;
