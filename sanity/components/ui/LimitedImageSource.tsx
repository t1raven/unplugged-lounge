import { useState } from 'react';
import { Card, Dialog, Stack, Text } from '@sanity/ui';
import type { AssetFromSource, AssetSource, AssetSourceComponentProps } from 'sanity';

const MAX_SIZE = 1 * 1024 * 1024; // 1MB (1,048,576 bytes)

function LimitedImageUploader({ onSelect, onClose }: AssetSourceComponentProps) {
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (!files.length) return;

    const oversized = files.find((file) => file.size > MAX_SIZE);

    if (oversized) {
      setError(`"${oversized.name}" 파일은 1MB를 초과합니다.`);

      e.target.value = '';
      return;
    }

    setError('');

    const assets: AssetFromSource[] = files.map((file) => ({
      kind: 'file',
      value: file as unknown as AssetFromSource['value'],
    }));

    onSelect(assets);
  };

  return (
    <Dialog id="limited-image-upload" header="이미지 업로드" width={1} open onClose={onClose}>
      <Card padding={4}>
        <Stack gap={4}>
          <Text size={1}>이미지 최대 용량: 1MB</Text>

          <input type="file" accept="image/*" onChange={handleChange} />

          {error && (
            <Text size={1} style={{ color: 'red' }}>
              {error}
            </Text>
          )}
        </Stack>
      </Card>
    </Dialog>
  );
}

export const limitedImageSource: AssetSource = {
  name: 'limited-image-upload',
  title: '이미지 업로드 (최대 1MB)',
  component: LimitedImageUploader,
};
