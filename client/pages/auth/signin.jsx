import SharedForm from "./auth-shared-from";

export default () => {
  return (
    <>
      <h1>sign in </h1>
      <SharedForm finalRoute={"signin"} />
    </>
  );
};
