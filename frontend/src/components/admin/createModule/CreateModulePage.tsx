import CreateModuleForm from './CreateModuleForm';
import UnitForm from './UnitForm';

type Props = {};

function CreateModulePage({}: Props) {
  const handleSaveDraftModule = () => {};

  const handlePublishModule = () => {};

  return (
    <div className="m-0 px-4 py-4 max-w-5xl">
      <h1 className="font-extrabold text-[28px] pb-4 ">Create New Module</h1>
      <CreateModuleForm />
      <div
        className="max-w-5xl px-16 py-9 my-6 rounded-3xl"
        style={{ backgroundColor: '#F2EAEA' }}
      >
        <UnitForm />

        <div className="mx-auto my-6 flex justify-center gap-2">
          <button
            type="submit"
            onClick={handleSaveDraftModule}
            className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 mr-4 w-32 h-10"
          >
            Save draft
          </button>
          <button
            type="submit"
            onClick={handlePublishModule}
            className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 mr-4 w-32 h-10"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateModulePage;
