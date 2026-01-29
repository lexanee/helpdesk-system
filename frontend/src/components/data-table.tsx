import {
  Group,
  Pagination,
  Paper,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useSocket } from "@/context/socket-context";

export interface Column<T> {
  accessor: keyof T | string;
  title: string;
  render?: (record: T) => React.ReactNode;
  width?: string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  onRowClick?: (record: T) => void;
  socketEvent?: string; // Event to listen for to invalidate queries
  socketRoom?: string; // Room to join (optional)
  queryKey?: string[]; // Query key to invalidate
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  isLoading,
  onRowClick,
  socketEvent,
  socketRoom,
  queryKey,
}: DataTableProps<T>) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (socket && socketEvent && queryKey) {
      if (socketRoom) {
        socket.emit(`join-${socketRoom}` as any);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleUpdate = (data: any) => {
        console.log(`Received ${socketEvent}:`, data);
        queryClient.invalidateQueries({ queryKey });
      };

      socket.on(socketEvent as any, handleUpdate);

      return () => {
        if (socketRoom) {
          socket.emit(`leave-${socketRoom}` as any);
        }
        socket.off(socketEvent as any, handleUpdate);
      };
    }
  }, [socket, socketEvent, socketRoom, queryKey, queryClient]);

  const totalPages = Math.ceil(total / limit);

  return (
    <Paper withBorder>
      <ScrollArea>
        <Table striped highlightOnHover={!!onRowClick} miw={800}>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col, index) => (
                <Table.Th key={index} style={{ width: col.width }}>
                  {col.title}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Text ta="center" py="md">
                    Loading...
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Text ta="center" py="md">
                    No records found
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((record) => (
                <Table.Tr
                  key={record.id}
                  onClick={() => onRowClick?.(record)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((col, index) => (
                    <Table.Td key={index}>
                      {col.render
                        ? col.render(record)
                        : ((record as unknown as Record<string, unknown>)[
                            col.accessor as string
                          ] as React.ReactNode)}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && onPageChange && (
        <Group justify="center" p="md">
          <Pagination total={totalPages} value={page} onChange={onPageChange} />
        </Group>
      )}
    </Paper>
  );
}
