interface PageTitleSectionPropsType {
  title: string;
  p: string;
}

function PageTitleSection(props: PageTitleSectionPropsType) {
  const { title, p } = props;
  return (
    <div className="mt-8 mb-6">
      <h1 className="text-2xl text-font-primary">{title}</h1>
      <p className="text-font-secondary">{p}</p>
    </div>
  );
}

export default PageTitleSection;
