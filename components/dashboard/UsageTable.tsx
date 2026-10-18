import { Table, Thead, Tbody, Tr, Th, Td } from "../ui/Table";
import { Badge } from "../ui/Badge";
import { formatDateTime, formatLatency } from "@/lib/format";

interface UsageLog {
  id: number;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number | null;
  status: string;
  created_at: string;
}

interface UsageTableProps {
  logs: UsageLog[];
}

export function UsageTable({ logs }: UsageTableProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-on-surface-variant">No usage logs yet.</p>;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Time</Th>
          <Th>Model</Th>
          <Th>Tokens</Th>
          <Th>Latency</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {logs.map((log) => (
          <Tr key={log.id}>
            <Td className="text-on-surface-variant">{formatDateTime(log.created_at)}</Td>
            <Td className="font-mono text-sm">{log.model}</Td>
            <Td className="font-mono text-sm">{log.total_tokens}</Td>
            <Td className="font-mono text-sm">{log.latency_ms ? formatLatency(log.latency_ms) : "-"}</Td>
            <Td>
              <Badge variant={log.status === "success" ? "success" : "error"}>
                {log.status}
              </Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
