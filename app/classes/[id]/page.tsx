import { getClass, getLinks } from "@/lib/data";
import { Class, Link as LinkType, Inquiry } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import FormattedDate from "@/components/FormattedDate";
import { getCurrentUser } from "@/lib/pocketbase-server";
import ClassDetailsManagement from "@/components/ClassDetailsManagement";
import ClassDetailsStudent from "@/components/ClassDetailsStudent";
import { getInquiries } from "@/lib/actions-inquiries";
import InquiryList from "@/components/inquiries/InquiryList";

export const dynamic = 'force-dynamic';

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let classData: Class;
  let links: LinkType[] = [];
  let inquiries: Inquiry[] = [];
  const user = await getCurrentUser();
  
  try {
    classData = await getClass(id);
    links = await getLinks(id);
    inquiries = await getInquiries({ classId: id });
  } catch (e) {
    console.error(e);
    return notFound();
  }

  const isAuthorized = user && (user.role === 'docente' || user.role === 'admin');

  if (isAuthorized) {
    return <div className="container mx-auto p-8 min-h-screen">
      <ClassDetailsManagement user={user} classData={classData} links={links} inquiries={inquiries} />
    </div>;
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <ClassDetailsStudent user={user} classData={classData} links={links} inquiries={inquiries} />
    </div>
  );
}
