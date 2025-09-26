const ReviewInfo = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Review Your Information</h2>
      <p><strong>Crop:</strong> {data.crop}</p>
      <p><strong>Farming Type:</strong> {data.farmingType}</p>
      <p><strong>Region:</strong> {data.region}</p>
      <p><strong>Previous Crop:</strong> {data.previousCrop}</p>
    </div>
  );
};

export default ReviewInfo;
