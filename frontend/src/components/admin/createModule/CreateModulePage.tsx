import CreateModuleForm from './CreateModuleForm';

type Props = {};

function CreateModulePage({}: Props) {
  return (
    <div className="m-0 px-4 py-4 max-w-5xl">
      <h1 className="font-extrabold text-[28px] pb-4 ">Create New Module</h1>
      <CreateModuleForm />
    </div>
  );
}

export default CreateModulePage;
