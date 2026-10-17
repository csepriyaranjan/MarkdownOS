import {
  Activity, AppWindow, Boxes, ClipboardList, Clock3, Cloud, Code2, Container, CreditCard, Database,
  Globe, HardDrive, KeyRound, Layers3, Mail, MemoryStick, Monitor, Network, Radio, Router, Server,
  Puzzle, Shield, Smartphone, Type, Workflow, type LucideIcon,
} from "lucide-react";

export type ArchitectureKind =
  | "client" | "browser" | "mobile" | "api" | "gateway" | "rest" | "load-balancer" | "proxy"
  | "backend" | "microservice" | "database" | "sql" | "nosql" | "redis" | "queue" | "kafka"
  | "cloud" | "internet" | "external" | "auth" | "firewall" | "storage" | "docker" | "kubernetes" | "cdn"
  | "vpc" | "subnet" | "service-registry" | "monitoring" | "logging" | "scheduler" | "email" | "payment" | "text" | "custom";

export type ArchitectureComponent = { kind: ArchitectureKind; label: string; icon: LucideIcon; group: string; color: string; visualOnly?: boolean };

export const architectureCatalog: ArchitectureComponent[] = [
  { kind: "text", label: "Description text", icon: Type, group: "Annotations", color: "slate", visualOnly: true },
  { kind: "custom", label: "Custom node", icon: Puzzle, group: "Annotations", color: "slate" },
  { kind: "client", label: "Client", icon: Monitor, group: "Entry points", color: "teal" },
  { kind: "browser", label: "Browser", icon: AppWindow, group: "Entry points", color: "teal" },
  { kind: "mobile", label: "Mobile App", icon: Smartphone, group: "Entry points", color: "teal" },
  { kind: "api", label: "API", icon: Code2, group: "Services", color: "blue" },
  { kind: "gateway", label: "API Gateway", icon: Router, group: "Services", color: "blue" },
  { kind: "rest", label: "REST API", icon: Workflow, group: "Services", color: "blue" },
  { kind: "load-balancer", label: "Load Balancer", icon: Activity, group: "Network", color: "amber" },
  { kind: "proxy", label: "Reverse Proxy", icon: Network, group: "Network", color: "amber" },
  { kind: "backend", label: "Backend Server", icon: Server, group: "Services", color: "blue" },
  { kind: "microservice", label: "Microservice", icon: Boxes, group: "Services", color: "blue" },
  { kind: "database", label: "Database", icon: Database, group: "Data", color: "violet" },
  { kind: "sql", label: "SQL Database", icon: Database, group: "Data", color: "violet" },
  { kind: "nosql", label: "NoSQL Database", icon: Layers3, group: "Data", color: "violet" },
  { kind: "redis", label: "Redis Cache", icon: MemoryStick, group: "Data", color: "violet" },
  { kind: "queue", label: "Message Queue", icon: Radio, group: "Data", color: "violet" },
  { kind: "kafka", label: "Kafka", icon: Radio, group: "Data", color: "violet" },
  { kind: "cloud", label: "Cloud", icon: Cloud, group: "Infrastructure", color: "green" },
  { kind: "internet", label: "Internet", icon: Globe, group: "Network", color: "amber" },
  { kind: "external", label: "External Service", icon: AppWindow, group: "Integrations", color: "slate" },
  { kind: "auth", label: "Authentication", icon: KeyRound, group: "Security", color: "red" },
  { kind: "firewall", label: "Firewall", icon: Shield, group: "Security", color: "red" },
  { kind: "storage", label: "Storage", icon: HardDrive, group: "Data", color: "violet" },
  { kind: "docker", label: "Docker Container", icon: Container, group: "Infrastructure", color: "green" },
  { kind: "kubernetes", label: "Kubernetes", icon: Boxes, group: "Infrastructure", color: "green" },
  { kind: "cdn", label: "CDN", icon: Cloud, group: "Network", color: "amber" },
  { kind: "vpc", label: "VPC", icon: Network, group: "Infrastructure", color: "green" },
  { kind: "subnet", label: "Subnet", icon: Layers3, group: "Infrastructure", color: "green" },
  { kind: "service-registry", label: "Service Registry", icon: Workflow, group: "Services", color: "blue" },
  { kind: "monitoring", label: "Monitoring", icon: Activity, group: "Operations", color: "amber" },
  { kind: "logging", label: "Log Service", icon: ClipboardList, group: "Operations", color: "slate" },
  { kind: "scheduler", label: "Scheduler", icon: Clock3, group: "Operations", color: "amber" },
  { kind: "email", label: "Email Service", icon: Mail, group: "Integrations", color: "slate" },
  { kind: "payment", label: "Payment Service", icon: CreditCard, group: "Integrations", color: "blue" },
];

export function architectureFor(kind?: string): ArchitectureComponent | undefined {
  return architectureCatalog.find((item) => item.kind === kind);
}

export function inferArchitectureKind(id: string, label: string): ArchitectureKind | undefined {
  const value = `${id} ${label}`.toLowerCase().replace(/[_-]+/g, " ");
  const matches: Array<[RegExp, ArchitectureKind]> = [
    [/\b(client|user|browser|web app|frontend|front end)\b/, "client"],
    [/\b(mobile|ios|android)\b/, "mobile"],
    [/\b(api gateway|gateway)\b/, "gateway"],
    [/\b(rest api|rest)\b/, "rest"],
    [/\b(api|service endpoint)\b/, "api"],
    [/\b(load balancer|\blb\b)\b/, "load-balancer"],
    [/\b(reverse proxy|proxy|nginx)\b/, "proxy"],
    [/\b(microservice|worker|backend|server|service)\b/, "microservice"],
    [/\b(postgres|postgresql|mysql|sql database|database|\bdb\b)\b/, "database"],
    [/\b(nosql|mongo|dynamo)\b/, "nosql"],
    [/\b(redis|cache)\b/, "redis"],
    [/\b(kafka|queue|event stream|message broker)\b/, "queue"],
    [/\b(cloud|aws|azure|gcp)\b/, "cloud"],
    [/\b(internet|external)\b/, "internet"],
    [/\b(auth|authentication|identity|oauth)\b/, "auth"],
    [/\b(firewall|waf)\b/, "firewall"],
    [/\b(storage|s3|blob)\b/, "storage"],
    [/\b(docker|container)\b/, "docker"],
    [/\b(kubernetes|k8s|cluster|pod)\b/, "kubernetes"],
    [/\b(cdn|edge)\b/, "cdn"],
  ];
  return matches.find(([pattern]) => pattern.test(value))?.[1];
}
