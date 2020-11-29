type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    input?: any;
    id?: string;
    roomId?: string;
    sortDirection: string;
    limit: number;
  };
};

exports.handler = async (event: AppSyncEvent) => {
  console.log(JSON.stringify({ 'Event Received': event }, null, 2));

  switch (event.info.fieldName) {
    default:
      return null;
  }
};
