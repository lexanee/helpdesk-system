import { Group, rem, Text } from "@mantine/core";
import { Dropzone, type FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";

interface FileUploadProps {
  onFilesSelected: (files: FileWithPath[]) => void;
  maxSize?: number;
  maxFiles?: number;
}

export default function FileUpload({
  onFilesSelected,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
}: FileUploadProps) {
  return (
    <Dropzone
      onDrop={onFilesSelected}
      maxSize={maxSize}
      maxFiles={maxFiles}
      accept={[
        MIME_TYPES.png,
        MIME_TYPES.jpeg,
        MIME_TYPES.pdf,
        MIME_TYPES.doc,
        MIME_TYPES.docx,
        MIME_TYPES.xls,
        MIME_TYPES.xlsx,
        "text/plain",
      ]}
    >
      <Group
        justify="center"
        gap="xl"
        mih={120}
        style={{ pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-blue-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-red-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-dimmed)",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag files here or click to select
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Attach up to {maxFiles} files, each file should not exceed{" "}
            {(maxSize / 1024 / 1024).toFixed(0)}MB
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            Supported: Images, PDF, Word, Excel, Text files
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
