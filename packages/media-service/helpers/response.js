module.exports = {
  data: ( res, data ) => res.json({ status: 200, data }),
  noData: res => res.json({ status: 204, message: 'No Data' }),
  success: res => res.json({ status: 201, message: 'Success' }),
  error: ( res, error ) => res.json({ status: 500, error })
};
