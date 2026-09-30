import api from '../../Instance/Instance';

export const getAllOpportunityApi = async (
  page = 1,
  source = '',
  search = '',
  categoryId = '',
) => {
  const params: any = {
    page,
  };

  if (source && source !== 'all') {
    params.source = source;
  }

  if (search) {
    params.search = search;
  }

  // ✅ FIXED
  if (categoryId) {
    params.categoryId = categoryId;
  }

  const res = await api.get(`/opportunity`, {
    params,
  });

  return res.data;
};

export const getAllMyopportunityApi = async (page = 1, username: any) => {
  const res = await api.get(`/opportunity`, {
    params: { page, username },
  });
  console.log('Get all my opportunity from api', res);
  return res.data;
};

export const getOpportunityDetailsById = async (opp_id: any) => {
  const res = await api.get(`/opportunity/${opp_id}`);
  return res.data.data;
};

export const getOpportunityRolesApi = async () => {
  const res = await api.get('/roles');
  return res?.data;
};

export const createOpportunityApi = async (formData: any) => {
  const res = await api.post(`/opportunity`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
  });
  return res.data;
};

export const updateOpportunityApi = async (opp_id: any, formData: any) => {
  const res = await api.put(`/opportunity/${opp_id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('update opporunity res from api', res);
  return res.data;
};

export const updateOpportunityStatusApi = async (
  opp_id: any,
  status: string,
) => {
  const res = await api.put(`/opportunity/${opp_id}/status`, {
    status, // ✅ SEND THIS
  });

  return res.data;
};

export const applyOpportunityApi = async (
  formData: FormData,
  opp_id: number,
) => {
  const res = await api.post(`/opportunity/${opp_id}/submit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

export const opportunityBookMarkApi = async (
  oppourtunity_id: any,
  type: any,
) => {
  const res = await api.post('/oppourtunity-wishlist', {
    oppourtunity_id,
    type,
  });
  return res.data; // ✅ MUST
};

export const deleteOpporunityApi = async (opp_id: string) => {
  const res = await api.delete(`/opportunity/${opp_id}/delete`);
  return res.data;
};

export const getOpportunitySubmissionsApi = async (
  page = 1,
  opportunity_id: any,
) => {
  const res = await api.get(`/opportunity/submissions`, {
    params: {
      page,
      opportunity_id,
    },
  });
  console.log('view all submisssions list', res);
  return res.data;
};

export const getOpportunityMySubmissionsApi = async (page = 1) => {
  const res = await api.get('/opportunity/user/submissions', {
    params: {
      page,
    },
  });
  return res.data;
};
