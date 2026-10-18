"use client";

import { Table, Thead, Tbody, Tr, Th, Td } from "../ui/Table";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { maskKey, formatDate, formatNumber, formatWindow } from "@/lib/format";

interface ApiKey {
  id: number;
  key: string;
  name: string;
  rate_limit_type: string;
  rate_limit_value: number | null;
  rate_limit_window: number;
  is_active: number;
  created_at: string;
}

interface ApiKeyTableProps {
  keys: ApiKey[];
  onDelete?: (id: number) => void;
}

export function ApiKeyTable({ keys, onDelete }: ApiKeyTableProps) {
  if (keys.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        No API keys yet. Create one to start sending requests to the gateway.
      </p>
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Key</Th>
          <Th>Rate Limit</Th>
          <Th>Status</Th>
          <Th>Created</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {keys.map((key) => (
          <Tr key={key.id}>
            <Td className="font-medium">{key.name}</Td>
            <Td className="font-mono text-sm">{maskKey(key.key)}</Td>
            <Td className="font-mono text-sm">
              {key.rate_limit_type === "unlimited" || !key.rate_limit_value
                ? "Unlimited"
                : `${formatNumber(key.rate_limit_value)} / ${formatWindow(key.rate_limit_window)}`}
            </Td>
            <Td>
              <Badge variant={key.is_active ? "success" : "error"}>
                {key.is_active ? "active" : "inactive"}
              </Badge>
            </Td>
            <Td className="text-on-surface-variant">{formatDate(key.created_at)}</Td>
            <Td>
              {onDelete && (
                <Button
                  variant="text"
                  size="sm"
                  className="min-h-12 md:min-h-8"
                  onClick={() => onDelete(key.id)}
                >
                  Delete
                </Button>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
