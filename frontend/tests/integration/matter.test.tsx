import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../src/pages/Dashboard';
import * as matterService from '../../src/services/matter.service';
import { AuthProvider } from '../../src/contexts/AuthContext';

// Mock services
vi.mock('../../src/services/matter.service');
vi.mock('../../src/config/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-id', email: 'test@example.com' },
    onAuthStateChanged: vi.fn((callback) => {
      callback({ uid: 'test-user-id', email: 'test@example.com' });
      return vi.fn();
    }),
  },
  db: {},
  storage: {},
}));

describe('Matter Management Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Matter List', () => {
    it('should display list of matters', async () => {
      const mockMatters = [
        {
          matterId: '1',
          title: 'Test Matter 1',
          clientName: 'Client A',
          status: 'active' as const,
          createdAt: new Date(),
          participants: [],
        },
        {
          matterId: '2',
          title: 'Test Matter 2',
          clientName: 'Client B',
          status: 'draft' as const,
          createdAt: new Date(),
          participants: [],
        },
      ];

      vi.mocked(matterService.MatterService.getMatters).mockResolvedValue(mockMatters);

      render(
        <BrowserRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Matter 1')).toBeInTheDocument();
        expect(screen.getByText('Test Matter 2')).toBeInTheDocument();
      });
    });

    it('should show empty state when no matters exist', async () => {
      vi.mocked(matterService.MatterService.getMatters).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no matters yet/i)).toBeInTheDocument();
      });
    });

    it('should filter matters by status', async () => {
      const mockMatters = [
        {
          matterId: '1',
          title: 'Active Matter',
          clientName: 'Client A',
          status: 'active' as const,
          createdAt: new Date(),
          participants: [],
        },
      ];

      vi.mocked(matterService.MatterService.getMatters).mockResolvedValue(mockMatters);

      render(
        <BrowserRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await userEvent.selectOptions(statusFilter, 'active');

      await waitFor(() => {
        expect(matterService.MatterService.getMatters).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ status: 'active' })
        );
      });
    });
  });

  describe('Create Matter', () => {
    it('should open create matter modal', async () => {
      vi.mocked(matterService.MatterService.getMatters).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      const createButton = screen.getByRole('button', { name: /create new matter/i });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/create new matter/i)).toBeInTheDocument();
      });
    });

    it('should create matter with valid data', async () => {
      const user = userEvent.setup();
      vi.mocked(matterService.MatterService.getMatters).mockResolvedValue([]);
      vi.mocked(matterService.MatterService.createMatter).mockResolvedValue('new-matter-id');

      render(
        <BrowserRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      const createButton = screen.getByRole('button', { name: /create new matter/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/create new matter/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      const clientInput = screen.getByLabelText(/client name/i);
      const submitButton = screen.getByRole('button', { name: /create matter/i });

      await user.type(titleInput, 'New Matter');
      await user.type(clientInput, 'New Client');
      await user.click(submitButton);

      await waitFor(() => {
        expect(matterService.MatterService.createMatter).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Matter',
            clientName: 'New Client',
          }),
          expect.any(String)
        );
      });
    });
  });
});

