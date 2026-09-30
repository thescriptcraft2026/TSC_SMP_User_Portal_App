import { useCallback } from 'react';

import { useDispatch } from 'react-redux';
import { createReport, getReports } from '../../redux/slices/reportSlice';


export const useReportActions = ({ reports, show }: any) => {
  const dispatch = useDispatch<any>();

  const handleOpenReport = useCallback(
    async ({ setMenuVisible, setReportVisible }: any) => {
      try {
        if (!reports || reports.length === 0) {
          await dispatch(getReports());
        }

        setMenuVisible(false);

        setReportVisible(true);
      } catch (e) {
        show({
          type: 'error',
          title: 'Failed to load report options',
        });
      }
    },
    [reports],
  );

  const handleReport = useCallback(
    async ({ data, activePost, setReportVisible }: any) => {
      try {
        if (!activePost?.id) return;

        const payload = {
          report_id: data.reason,

          description: data.message || '',

          synopses_id: activePost.id,

          reported_user_id: activePost?.userId,
        };

        const res: any = await dispatch(createReport(payload));

        if (res?.meta?.requestStatus !== 'fulfilled') {
          throw new Error(res?.payload || 'Report failed');
        }

        show({
          type: 'success',
          title: 'Report submitted',
        });

        setReportVisible(false);
      } catch (error: any) {
        show({
          type: 'error',
          title: error?.message || 'Something went wrong',
        });
      }
    },
    [],
  );

  return {
    handleOpenReport,
    handleReport,
  };
};
