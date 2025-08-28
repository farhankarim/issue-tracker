const Issue = (props) => {
  return (
    <div className="Issue">
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <img width={200} src={props.image} alt={props.name} />
    </div>
  );
};

export default Issue;