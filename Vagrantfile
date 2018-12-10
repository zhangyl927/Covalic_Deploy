Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"
  config.vm.synced_folder "/home/ylzhang/repos/opt_covalic", "/opt/covalic"
  config.vm.provider "virtualbox" do |v|
    v.memory = 4096
    v.cpus = 2
  end
  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "ansible/vagrant.yml"
    ansible.verbose = "v"
  end
end
