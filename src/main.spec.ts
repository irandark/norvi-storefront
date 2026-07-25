const { bootstrapApplication } = vi.hoisted(() => ({
  bootstrapApplication: vi.fn(),
}));

vi.mock('@angular/platform-browser', () => ({ bootstrapApplication }));

describe('application bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    bootstrapApplication.mockReset();
  });

  it('bootstraps the root application', async () => {
    bootstrapApplication.mockResolvedValueOnce(undefined);

    await import('./main');

    expect(bootstrapApplication).toHaveBeenCalledOnce();
  });

  it('reports a bootstrap failure', async () => {
    const error = new Error('bootstrap failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    bootstrapApplication.mockRejectedValueOnce(error);

    await import('./main');
    await Promise.resolve();

    expect(consoleError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });
});
