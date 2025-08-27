const Issue = (props) => {
  return (
    <div className="Issue">
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <img src={props.image} alt={props.name} />
    </div>
  );
};

export default Issue;