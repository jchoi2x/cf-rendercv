import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const s3SendMock = vi.hoisted(() => vi.fn().mockResolvedValue({}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = s3SendMock;
  },
  PutObjectCommand: class MockPutObjectCommand {
    input: {
      Bucket?: string;
      Key?: string;
      ContentType?: string;
      Body?: Uint8Array;
    };

    constructor(input: MockPutObjectCommand['input']) {
      this.input = input;
    }
  },
}));

describe('uploadPdfToS3', () => {
  let uploadPdfToS3: typeof import('../s3').uploadPdfToS3;

  beforeEach(async () => {
    s3SendMock.mockClear();
    s3SendMock.mockResolvedValue({});
    ({ uploadPdfToS3 } = await import('../s3'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('puts object with default prefix and content type, returns public URL', async () => {
    const uuidSpy = vi
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' as ReturnType<Crypto['randomUUID']>);

    try {
      const buffer = new ArrayBuffer(3);
      new Uint8Array(buffer).set([1, 2, 3]);

      const url = await uploadPdfToS3('my-bucket', buffer);

      expect(url).toBe('https://public.example.com/rendercv/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf');
      expect(s3SendMock).toHaveBeenCalledTimes(1);

      const cmd = s3SendMock.mock.calls[0]?.[0] as InstanceType<
        typeof import('@aws-sdk/client-s3').PutObjectCommand
      >;
      expect(cmd.input.Bucket).toBe('my-bucket');
      expect(cmd.input.Key).toBe('rendercv/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf');
      expect(cmd.input.ContentType).toBe('application/pdf');
      expect(cmd.input.Body).toEqual(new Uint8Array([1, 2, 3]));
    } finally {
      uuidSpy.mockRestore();
    }
  });

  it('honors prefix, name, and contentType options', async () => {
    const buffer = new TextEncoder().encode('hi').buffer;

    const url = await uploadPdfToS3('other-bucket', buffer, {
      prefix: 'uploads/cv',
      name: 'fixed-name',
      contentType: 'application/pdf; profile=my-profile',
    });

    expect(url).toBe('https://public.example.com/uploads/cv/fixed-name.pdf');

    const cmd = s3SendMock.mock.calls[0]?.[0] as InstanceType<
      typeof import('@aws-sdk/client-s3').PutObjectCommand
    >;
    expect(cmd.input.Key).toBe('uploads/cv/fixed-name.pdf');
    expect(cmd.input.ContentType).toBe('application/pdf; profile=my-profile');
    expect(cmd.input.Body).toEqual(new Uint8Array(new TextEncoder().encode('hi')));
  });
});
